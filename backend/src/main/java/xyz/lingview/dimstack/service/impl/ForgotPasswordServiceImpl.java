package xyz.lingview.dimstack.service.impl;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.dto.request.ForgotPasswordDTO;
import xyz.lingview.dimstack.dto.response.ForgotPasswordResponseDTO;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.ForgotPasswordService;
import xyz.lingview.dimstack.service.MailService;
import xyz.lingview.dimstack.util.CaptchaUtil;
import xyz.lingview.dimstack.util.PasswordUtil;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.util.SiteConfigUtil;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * @Author: lingview
 * @Date: 2026/01/13 18:59:30
 * @Description: 忘记密码服务实现类
 * @Version: 2.2
 */
@Slf4j
@Service
public class ForgotPasswordServiceImpl implements ForgotPasswordService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private UserInformationMapper userInformationMapper;

    @Autowired
    private MailService mailService;

    @Autowired
    private SiteConfigUtil siteConfigUtil;

    private static final String FORGOT_PASSWORD_CAPTCHA_PREFIX = "dimstack:forgot_password_captcha_";
    private static final String FORGOT_PASSWORD_FAIL_COUNT_PREFIX = "dimstack:forgot_password_fail_";
    private static final String FORGOT_PASSWORD_RATE_LIMIT_PREFIX = "dimstack:forgot_password_rate_limit_";
    private static final String FORGOT_PASSWORD_IP_LIMIT_PREFIX = "dimstack:forgot_password_ip_limit_";
    private static final String FORGOT_PASSWORD_USER_FAIL_PREFIX = "dimstack:forgot_password_user_fail_";

    private static final String SESSION_FORGOT_PASSWORD_CAPTCHA_KEY_ATTR = "dimstack:forgotPasswordCaptchaKey";
    private static final String SESSION_FORGOT_PASSWORD_VERIFIED_ATTR = "forgotPasswordVerified";
    private static final String SESSION_FORGOT_PASSWORD_VERIFIED_USER = "forgotPasswordVerifiedUser";
    private static final String SESSION_FORGOT_PASSWORD_VERIFIED_EMAIL_ATTR = "forgotPasswordVerifiedEmail";

    private static final int MAX_VERIFY_ATTEMPTS = 5; // 最大验证尝试次数
    private static final int VERIFY_LOCK_MINUTES = 30; // 验证锁定时间（分钟）
    private static final int SEND_CAPTCHA_COOLDOWN_SECONDS = 60; // 发送验证码冷却时间（秒）
    private static final int IP_HOURLY_LIMIT = 10; // 每小时每IP最大请求次数
    private static final int USER_FAIL_THRESHOLD = 3; // 用户信息错误阈值


    @Override
    public ApiResponse<Map<String, Object>> sendForgotPasswordCaptcha(
            ForgotPasswordDTO request,
            HttpSession session,
            HttpServletRequest httpRequest) {

        long startTime = System.currentTimeMillis();

        try {
            String username = request.getUsername();
            String email = request.getEmail();

            if (username == null || username.trim().isEmpty()) {
                return ApiResponse.error(400, "用户名不能为空");
            }

            if (email == null || email.trim().isEmpty()) {
                return ApiResponse.error(400, "邮箱不能为空");
            }

            String clientIp = getClientIp(httpRequest);
            if (!checkIpRateLimit(clientIp)) {
                log.warn("IP {} 请求过于频繁", clientIp);
                return ApiResponse.error(429, "请求过于频繁，请稍后再试");
            }

            // 检查发送频率限制
            String rateLimitKey = FORGOT_PASSWORD_RATE_LIMIT_PREFIX + email;
            String lastSendTime = redisTemplate.opsForValue().get(rateLimitKey);

            if (lastSendTime != null) {
                return ApiResponse.error(429, "验证码已发送，请60秒后再试");
            }

            // 检查用户是否存在且邮箱匹配
            UserInformation userInfo = userInformationMapper.getUserByUsernameAndEmail(username, email);

            if (userInfo == null) {
                String userFailKey = FORGOT_PASSWORD_USER_FAIL_PREFIX + username;
                Long failCount = redisTemplate.opsForValue().increment(userFailKey);
                redisTemplate.expire(userFailKey, 1, TimeUnit.HOURS);

                log.warn("用户名 {} 或邮箱 {} 不匹配，失败次数: {}", username, email, failCount);

                if (failCount == 1) {
                    String correctEmail = userInformationMapper.getEmailByUsername(username);
                    if (correctEmail != null && !correctEmail.isEmpty()) {
                        sendFirstAttemptWarning(
                                correctEmail,
                                username,
                                clientIp,
                                email
                        );
                        log.info("检测到用户 {} 的首次异常密码找回尝试，已向注册邮箱发送警告", username);
                    }
                }

                redisTemplate.opsForValue().set(rateLimitKey, "1", SEND_CAPTCHA_COOLDOWN_SECONDS, TimeUnit.SECONDS);

                ensureMinimumDelay(startTime, 800);

                if (failCount <= USER_FAIL_THRESHOLD) {
                    return ApiResponse.error(400, "用户名或邮箱不正确，请检查后重试");
                } else {
                    log.warn("用户 {} 多次尝试失败，切换为模糊提示模式", username);
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "如果该账户存在，验证码已发送到您的邮箱");
                    return ApiResponse.success(response);
                }
            }

            String userFailKey = FORGOT_PASSWORD_USER_FAIL_PREFIX + username;
            redisTemplate.delete(userFailKey);

            // 生成验证码
            String captcha = CaptchaUtil.generateCaptcha(6);
            String captchaKey = CaptchaUtil.generateCaptchaKey();

            String oldCaptchaKey = (String) session.getAttribute(SESSION_FORGOT_PASSWORD_CAPTCHA_KEY_ATTR);
            if (oldCaptchaKey != null) {
                redisTemplate.delete(FORGOT_PASSWORD_CAPTCHA_PREFIX + oldCaptchaKey);
            }

            // 保存新验证码到Redis（有效期10分钟）
            redisTemplate.opsForValue().set(
                    FORGOT_PASSWORD_CAPTCHA_PREFIX + captchaKey,
                    captcha.toLowerCase(),
                    10,
                    TimeUnit.MINUTES
            );

            session.setAttribute(SESSION_FORGOT_PASSWORD_CAPTCHA_KEY_ATTR, captchaKey);

            // 发送验证码到邮箱
            String siteName = siteConfigUtil.getSiteName();
            mailService.sendSimpleMail(email, "【" + siteName + "】密码重置验证码",
                    "您正在重置密码，验证码是：" + captcha + "，有效期10分钟。如果不是本人操作，请忽略。");

            redisTemplate.opsForValue().set(rateLimitKey, "1", SEND_CAPTCHA_COOLDOWN_SECONDS, TimeUnit.SECONDS);

            log.info("忘记密码验证码已发送至邮箱: {}", maskEmail(email));

            ensureMinimumDelay(startTime, 800);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "验证码已发送到您的邮箱");
            return ApiResponse.success(response);

        } catch (Exception e) {
            log.error("发送忘记密码验证码时发生异常", e);
            ensureMinimumDelay(startTime, 800);
            return ApiResponse.error(500, "发送验证码失败，请稍后再试");
        }
    }

    /**
     * 验证验证码
     */
    @Override
    public ApiResponse<ForgotPasswordResponseDTO> verifyForgotPassword(
            ForgotPasswordDTO request,
            HttpSession session,
            HttpServletRequest httpRequest) {
        try {
            String username = request.getUsername();
            String email = request.getEmail();
            String captcha = request.getCaptcha();

            if (username == null || username.trim().isEmpty()) {
                return ApiResponse.error(400, "用户名不能为空");
            }

            if (email == null || email.trim().isEmpty()) {
                return ApiResponse.error(400, "邮箱不能为空");
            }

            if (captcha == null || captcha.isEmpty()) {
                return ApiResponse.error(400, "验证码不能为空");
            }

            String clientIp = getClientIp(httpRequest);
            if (!checkIpRateLimit(clientIp)) {
                log.warn("IP {} 请求过于频繁", clientIp);
                return ApiResponse.error(429, "请求过于频繁，请稍后再试");
            }

            String failKey = FORGOT_PASSWORD_FAIL_COUNT_PREFIX + username;
            String failCountStr = redisTemplate.opsForValue().get(failKey);
            int failCount = failCountStr != null ? Integer.parseInt(failCountStr) : 0;

            if (failCount >= MAX_VERIFY_ATTEMPTS) {
                log.warn("用户 {} 验证失败次数过多，已锁定", username);

                // 发送可疑活动通知
                UserInformation userInfo = userInformationMapper.getUserByUsernameAndEmail(username, email);
                if (userInfo != null) {
                    sendSuspiciousActivityNotification(
                            email,
                            username,
                            clientIp,
                            "验证码尝试次数过多（" + failCount + "次）"
                    );
                }

                return ApiResponse.error(429, "验证失败次数过多，请" + VERIFY_LOCK_MINUTES + "分钟后再试");
            }

            String sessionCaptchaKey = (String) session.getAttribute(SESSION_FORGOT_PASSWORD_CAPTCHA_KEY_ATTR);
            if (sessionCaptchaKey == null) {
                return ApiResponse.error(400, "未找到验证码记录，请重新发送验证码");
            }

            String redisCaptchaKey = FORGOT_PASSWORD_CAPTCHA_PREFIX + sessionCaptchaKey;
            String redisCaptcha = redisTemplate.opsForValue().get(redisCaptchaKey);

            if (redisCaptcha == null) {
                log.warn("Redis 中无验证码 - key: {}", redisCaptchaKey);
                cleanUpForgotPasswordCaptcha(session, redisCaptchaKey);
                return ApiResponse.error(400, "验证码已过期，请重新获取");
            }

            if (!CaptchaUtil.validateCaptcha(redisCaptcha, captcha)) {

                redisTemplate.opsForValue().increment(failKey);
                redisTemplate.expire(failKey, VERIFY_LOCK_MINUTES, TimeUnit.MINUTES);

                int remainingAttempts = MAX_VERIFY_ATTEMPTS - failCount - 1;
                log.warn("用户 {} 验证码错误，剩余尝试次数: {}", username, remainingAttempts);

                if (remainingAttempts <= 0) {
                    cleanUpForgotPasswordCaptcha(session, redisCaptchaKey);
                    return ApiResponse.error(429, "验证失败次数过多，请" + VERIFY_LOCK_MINUTES + "分钟后再试");
                }

                return ApiResponse.error(400, "验证码错误，剩余尝试次数: " + remainingAttempts);
            }

            UserInformation userInfo = userInformationMapper.getUserByUsernameAndEmail(username, email);
            if (userInfo == null) {
                redisTemplate.opsForValue().increment(failKey);
                redisTemplate.expire(failKey, VERIFY_LOCK_MINUTES, TimeUnit.MINUTES);
                cleanUpForgotPasswordCaptcha(session, redisCaptchaKey);
                return ApiResponse.error(400, "用户名或邮箱不匹配");
            }

            redisTemplate.delete(failKey);

            session.setAttribute(SESSION_FORGOT_PASSWORD_VERIFIED_ATTR, true);
            session.setAttribute(SESSION_FORGOT_PASSWORD_VERIFIED_USER, username);
            session.setAttribute(SESSION_FORGOT_PASSWORD_VERIFIED_EMAIL_ATTR, email);
            session.removeAttribute(SESSION_FORGOT_PASSWORD_CAPTCHA_KEY_ATTR);

            redisTemplate.delete(redisCaptchaKey);

            log.info("用户 {} 验证码验证成功", username);

            ForgotPasswordResponseDTO response = new ForgotPasswordResponseDTO();
            response.setSuccess(true);
            response.setMessage("验证成功，请设置新密码");
            return ApiResponse.success(response);

        } catch (Exception e) {
            log.error("验证验证码时发生异常", e);
            return ApiResponse.error(500, "验证失败，请稍后再试");
        }
    }


    /**
     * 重置密码
     */
    @Override
    public ApiResponse<ForgotPasswordResponseDTO> resetPassword(
            ForgotPasswordDTO request,
            HttpSession session,
            HttpServletRequest httpRequest) {
        try {
            String username = request.getUsername();
            String email = request.getEmail();
            String newPassword = request.getNewPassword();
            String confirmNewPassword = request.getConfirmNewPassword();

            if (username == null || username.trim().isEmpty()) {
                return ApiResponse.error(400, "用户名不能为空");
            }

            if (email == null || email.trim().isEmpty()) {
                return ApiResponse.error(400, "邮箱不能为空");
            }

            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ApiResponse.error(400, "新密码不能为空");
            }

            if (confirmNewPassword == null || confirmNewPassword.trim().isEmpty()) {
                return ApiResponse.error(400, "确认密码不能为空");
            }

            if (!newPassword.equals(confirmNewPassword)) {
                return ApiResponse.error(400, "两次输入的密码不一致");
            }

            if (newPassword.length() < 6) {
                return ApiResponse.error(400, "密码长度不能少于6位");
            }

            String clientIp = getClientIp(httpRequest);
            if (!checkIpRateLimit(clientIp)) {
                log.warn("IP {} 请求过于频繁", clientIp);
                return ApiResponse.error(429, "请求过于频繁，请稍后再试");
            }

            Boolean verified = (Boolean) session.getAttribute(SESSION_FORGOT_PASSWORD_VERIFIED_ATTR);
            String verifiedUser = (String) session.getAttribute(SESSION_FORGOT_PASSWORD_VERIFIED_USER);

            if (verified == null || !verified || verifiedUser == null || !verifiedUser.equals(username)) {
                return ApiResponse.error(400, "请先完成验证");
            }

            UserInformation userInfo = userInformationMapper.getUserByUsernameAndEmail(username, email);
            if (userInfo == null) {
                return ApiResponse.error(400, "用户名或邮箱不匹配");
            }

            String hashedPassword = PasswordUtil.hashPassword(newPassword);
            int result = userInformationMapper.updatePasswordByUsername(username, hashedPassword);

            if (result <= 0) {
                return ApiResponse.error(500, "密码更新失败");
            }

            sendPasswordChangeNotification(email, username, clientIp);

            session.removeAttribute(SESSION_FORGOT_PASSWORD_VERIFIED_ATTR);
            session.removeAttribute(SESSION_FORGOT_PASSWORD_VERIFIED_USER);

            String userFailKey = FORGOT_PASSWORD_USER_FAIL_PREFIX + username;
            redisTemplate.delete(userFailKey);

            session.invalidate();

            log.info("用户 {} 密码重置成功，已发送通知邮件", username);

            ForgotPasswordResponseDTO response = new ForgotPasswordResponseDTO();
            response.setSuccess(true);
            response.setMessage("密码重置成功");
            return ApiResponse.success(response);

        } catch (Exception e) {
            log.error("重置密码时发生异常", e);
            return ApiResponse.error(500, "密码重置失败，请稍后再试");
        }
    }

    /**
     * 发送首次异常尝试警告
     */
    private void sendFirstAttemptWarning(String correctEmail, String username, String clientIp, String wrongEmail) {
        try {
            String siteName = siteConfigUtil.getSiteName();
            String currentTime = java.time.LocalDateTime.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            String emailContent = String.format(
                    "尊敬的用户 %s，您好：\n\n" +
                            "我们检测到有人正在尝试使用您的用户名重置密码，但提供的邮箱地址与您的注册邮箱不符。\n\n" +
                            "尝试详情：\n" +
                            "- 尝试时间：%s\n" +
                            "- 来源IP：%s\n" +
                            "- 使用的用户名：%s\n" +
                            "- 提供的邮箱：%s（错误）\n" +
                            "- 您的注册邮箱：%s\n\n" +
                            "安全提醒：\n" +
                            "如果这不是您本人的操作，说明有人可能知道了您的用户名，正在尝试重置您的密码。\n\n" +
                            "建议您立即采取以下措施：\n" +
                            "1. 确认您的密码足够强壮且未在其他网站使用\n" +
                            "2. 如果使用了相同密码，请立即修改密码\n" +
                            "3. 检查账户近期登录记录是否有异常\n" +
                            "如果是您本人操作但输错了邮箱，请使用正确的邮箱地址重试。\n\n" +
                            "%s 安全团队\n" +
                            "%s",
                    username,
                    currentTime,
                    clientIp,
                    username,
                    maskEmailForUser(wrongEmail),
                    maskEmailForUser(correctEmail),
                    siteName,
                    currentTime
            );

            mailService.sendSimpleMail(
                    correctEmail,
                    "【" + siteName + "】安全提醒：检测到密码重置尝试",
                    emailContent
            );

            log.info("首次异常尝试警告邮件已发送至用户 {} 的注册邮箱", username);

        } catch (Exception e) {
            log.error("发送首次异常尝试警告邮件失败，用户: {}", username, e);
        }
    }

    /**
     * 发送密码修改通知邮件
     */
    private void sendPasswordChangeNotification(String email, String username, String clientIp) {
        try {
            String siteName = siteConfigUtil.getSiteName();
            String currentTime = java.time.LocalDateTime.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            String emailContent = String.format(
                    "尊敬的用户 %s，您好：\n\n" +
                            "您的账户密码已于 %s 成功修改。\n\n" +
                            "修改详情：\n" +
                            "- 操作时间：%s\n" +
                            "- 操作IP：%s\n" +
                            "- 操作方式：密码找回\n\n" +
                            "如果这不是您本人的操作，请立即：\n" +
                            "1. 重新修改您的密码\n" +
                            "2. 检查账户安全设置\n\n" +
                            "为了您的账户安全，建议：\n" +
                            "- 使用强密码（包含大小写字母、数字和特殊字符）\n" +
                            "- 不要在多个网站使用相同密码\n" +
                            "- 定期更换密码\n\n" +
                            "如果是您本人操作，请忽略此邮件。\n\n" +
                            "%s 团队\n" +
                            "%s",
                    username,
                    currentTime,
                    currentTime,
                    clientIp,
                    siteName,
                    currentTime
            );

            mailService.sendSimpleMail(
                    email,
                    "【" + siteName + "】重要：您的密码已修改",
                    emailContent
            );

            log.info("密码修改通知邮件已发送至: {}", maskEmail(email));

        } catch (Exception e) {
            log.error("发送密码修改通知邮件失败，用户: {}, 邮箱: {}", username, maskEmail(email), e);
        }
    }

    /**
     * 发送可疑密码修改尝试通知
     */
    private void sendSuspiciousActivityNotification(String email, String username, String clientIp, String reason) {
        try {
            String siteName = siteConfigUtil.getSiteName();
            String currentTime = java.time.LocalDateTime.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            String emailContent = String.format(
                    "尊敬的用户 %s，您好：\n\n" +
                            "我们检测到您的账户存在异常的密码修改尝试。\n\n" +
                            "尝试详情：\n" +
                            "- 尝试时间：%s\n" +
                            "- 来源IP：%s\n" +
                            "- 原因：%s\n\n" +
                            "如果这不是您本人的操作，您的账户可能面临安全风险。\n\n" +
                            "请立即采取以下措施：\n" +
                            "1. 修改您的密码\n" +
                            "2. 检查账户绑定的邮箱是否正确\n" +
                            "如果是您本人操作，请忽略此邮件。\n\n" +
                            "%s 安全团队\n" +
                            "%s",
                    username,
                    currentTime,
                    clientIp,
                    reason,
                    siteName,
                    currentTime
            );

            mailService.sendSimpleMail(
                    email,
                    "【" + siteName + "】安全警告：检测到可疑的密码修改尝试",
                    emailContent
            );

            log.info("可疑活动通知邮件已发送至: {}", maskEmail(email));

        } catch (Exception e) {
            log.error("发送可疑活动通知邮件失败，用户: {}, 邮箱: {}", username, maskEmail(email), e);
        }
    }

    private void cleanUpForgotPasswordCaptcha(HttpSession session, String redisCaptchaKey) {
        try {
            redisTemplate.delete(redisCaptchaKey);
            session.removeAttribute(SESSION_FORGOT_PASSWORD_CAPTCHA_KEY_ATTR);
            session.removeAttribute(SESSION_FORGOT_PASSWORD_VERIFIED_USER);
            log.debug("已清理忘记密码验证码 - Redis Key: {}", redisCaptchaKey);
        } catch (Exception e) {
            log.warn("清理忘记密码验证码时发生异常", e);
        }
    }

    /**
     * 检查IP速率限制
     */
    private boolean checkIpRateLimit(String ip) {
        try {
            String ipLimitKey = FORGOT_PASSWORD_IP_LIMIT_PREFIX + ip;
            Long requestCount = redisTemplate.opsForValue().increment(ipLimitKey);

            if (requestCount == null) {
                return true;
            }

            if (requestCount == 1) {
                redisTemplate.expire(ipLimitKey, 1, TimeUnit.HOURS);
            }

            return requestCount <= IP_HOURLY_LIMIT;
        } catch (Exception e) {
            log.error("检查IP速率限制时发生异常", e);
            return true;
        }
    }


    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    private String maskEmail(String email) {
        if (email == null || email.length() < 3) {
            return "***";
        }
        int atIndex = email.indexOf('@');
        if (atIndex <= 0) {
            return "***";
        }
        String localPart = email.substring(0, atIndex);
        String domain = email.substring(atIndex);

        if (localPart.length() <= 2) {
            return localPart.charAt(0) + "***" + domain;
        }
        return localPart.substring(0, 2) + "***" + domain;
    }


    private String maskEmailForUser(String email) {
        if (email == null || email.length() < 3) {
            return "***@***";
        }
        int atIndex = email.indexOf('@');
        if (atIndex <= 0) {
            return "***@***";
        }
        String localPart = email.substring(0, atIndex);
        String domain = email.substring(atIndex + 1);

        String maskedLocal;
        if (localPart.length() <= 3) {
            maskedLocal = localPart.charAt(0) + "***";
        } else {
            maskedLocal = localPart.substring(0, 2) + "***" + localPart.charAt(localPart.length() - 1);
        }

        String maskedDomain;
        int dotIndex = domain.indexOf('.');
        if (dotIndex > 0) {
            String domainName = domain.substring(0, dotIndex);
            String topLevel = domain.substring(dotIndex);
            if (domainName.length() <= 2) {
                maskedDomain = domainName.charAt(0) + "***" + topLevel;
            } else {
                maskedDomain = domainName.substring(0, 1) + "***" + topLevel;
            }
        } else {
            maskedDomain = domain.charAt(0) + "***";
        }

        return maskedLocal + "@" + maskedDomain;
    }

    private void ensureMinimumDelay(long startTime, long minimumDelayMs) {
        try {
            long elapsedTime = System.currentTimeMillis() - startTime;
            if (elapsedTime < minimumDelayMs) {
                Thread.sleep(minimumDelayMs - elapsedTime);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("延迟等待被中断", e);
        }
    }
}
