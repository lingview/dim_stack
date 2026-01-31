package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.domain.Login;
import xyz.lingview.dimstack.dto.request.LoginDTO;
import xyz.lingview.dimstack.dto.response.LoginResponseDTO;
import xyz.lingview.dimstack.dto.response.LogoutResponseDTO;
import xyz.lingview.dimstack.mapper.LoginMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.MailService;
import xyz.lingview.dimstack.service.NotificationService;
import xyz.lingview.dimstack.util.CaptchaUtil;
import xyz.lingview.dimstack.util.SiteConfigUtil;
import xyz.lingview.dimstack.util.PasswordUtil;
import xyz.lingview.dimstack.common.ApiResponse;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * @Auther: lingview
 * @Date: 2025/08/26 22:57:54
 * @Description: 用户登录控制器
 */
@Slf4j
@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    private LoginMapper loginMapper;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private MailService mailService;

    @Autowired
    private UserInformationMapper userInformationMapper;

    @Autowired
    private SiteConfigUtil siteConfigUtil;

    @Autowired
    private NotificationService notificationService;

    private static final String CAPTCHA_PREFIX = "captcha_";
    private static final String SESSION_CAPTCHA_KEY_ATTR = "captchaKey";

    /**
     * 用户登录接口
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponseDTO> login(
            @RequestBody LoginDTO loginDTO,
            HttpSession session) {

        try {
            String username = loginDTO.getUsername();
            String password = loginDTO.getPassword();
            String captcha = loginDTO.getCaptcha();
            String captchaKey = loginDTO.getCaptchaKey();

            if (username == null || username.trim().isEmpty()) {
                return ApiResponse.error(400, "用户名不能为空");
            }
            if (password == null || password.isEmpty()) {
                return ApiResponse.error(400, "密码不能为空");
            }
            if (captcha == null || captcha.isEmpty()) {
                return ApiResponse.error(400, "验证码不能为空");
            }
            if (captchaKey == null || captchaKey.isEmpty()) {
                return ApiResponse.error(400, "验证码无效");
            }

            String sessionCaptchaKey = (String) session.getAttribute(SESSION_CAPTCHA_KEY_ATTR);
            String currentSessionId = session.getId();

            log.info("登录请求 - Session ID: {}, 请求 captchaKey: {}, Session captchaKey: {}",
                    currentSessionId, captchaKey, sessionCaptchaKey);

            if (sessionCaptchaKey == null || !sessionCaptchaKey.equals(captchaKey)) {
                log.warn("验证码 key 不匹配 - Session: {}, 请求: {}", sessionCaptchaKey, captchaKey);
                cleanUpCaptcha(session, CAPTCHA_PREFIX + captchaKey);
                return ApiResponse.error(400, "验证码无效或已过期，请重新获取");
            }

            String redisCaptchaKey = CAPTCHA_PREFIX + captchaKey;
            String redisCaptcha = redisTemplate.opsForValue().get(redisCaptchaKey);

            if (redisCaptcha == null) {
                log.warn("Redis 中无验证码 - key: {}", redisCaptchaKey);
                cleanUpCaptcha(session, redisCaptchaKey);
                return ApiResponse.error(400, "验证码已过期，请重新获取");
            }

            if (!CaptchaUtil.validateCaptcha(redisCaptcha, captcha)) {
                log.warn("验证码错误 - 输入: {}, 正确: {}", captcha, redisCaptcha);
                cleanUpCaptcha(session, redisCaptchaKey);
                return ApiResponse.error(400, "验证码错误");
            }

            cleanUpCaptcha(session, redisCaptchaKey);
            log.info("验证码校验通过，已立即删除 - key: {}", redisCaptchaKey);

            var login = new Login();
            login.setUsername(username);
            login.setPassword(password);

            var result = loginMapper.loginUser(login);
            if (result == null || !PasswordUtil.checkPassword(password, result.getPassword())) {
                return ApiResponse.error(401, "用户名或密码错误");
            }


            session.setAttribute("username", username);
            session.setAttribute("isLoggedIn", true);
            session.setAttribute("loginTime", System.currentTimeMillis());

            log.info("用户 {} 登录成功，Session ID: {}", username, session.getId());

            if (siteConfigUtil.isNotificationEnabled()) {
                String email = userInformationMapper.getEmailByUsername(username);
                String formattedDate = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
                if (email != null && !email.trim().isEmpty()) {
                    String siteName = siteConfigUtil.getSiteName();
                    mailService.sendSimpleMail(email, siteName + " 登录成功",
                            "用户：" + username + " 于 " + formattedDate + " 登录成功");
                }
                notificationService.sendSystemNotification(username, "系统通知", "用户：" + username + " 于 " + formattedDate + " 登录成功");
            }

            var data = new LoginResponseDTO();
            data.setSuccess(true);
            data.setMessage("登录成功");
            return ApiResponse.success(data);

        } catch (Exception e) {
            log.error("登录过程发生未知错误", e);
            return ApiResponse.error(500, "登录失败，请稍后再试");
        }
    }

    /**
     * 用户登出接口
     */
    @PostMapping("/logout")
    public ApiResponse<LogoutResponseDTO> logout(HttpSession session) {
        String username = (String) session.getAttribute("username");
        session.invalidate();
        log.info("用户 {} 登出成功", username != null ? username : "Unknown");

        var data = new LogoutResponseDTO();
        data.setSuccess(true);
        data.setMessage("登出成功");
        return ApiResponse.success(data);
    }

    private void cleanUpCaptcha(HttpSession session, String redisCaptchaKey) {
        try {
            redisTemplate.delete(redisCaptchaKey);
            session.removeAttribute(SESSION_CAPTCHA_KEY_ATTR);
            log.debug("已清理验证码 - Redis Key: {}, Session Attribute: {}", redisCaptchaKey, SESSION_CAPTCHA_KEY_ATTR);
        } catch (Exception e) {
            log.warn("清理验证码时发生异常", e);
        }
    }
}