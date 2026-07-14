package xyz.lingview.dimstack.service.impl;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.Login;
import xyz.lingview.dimstack.dto.request.LoginDTO;
import xyz.lingview.dimstack.dto.response.LoginResponseDTO;
import xyz.lingview.dimstack.mapper.LoginMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.service.LoginService;
import xyz.lingview.dimstack.service.MailService;
import xyz.lingview.dimstack.service.NotificationService;
import xyz.lingview.dimstack.util.CaptchaUtil;
import xyz.lingview.dimstack.util.PasswordUtil;
import xyz.lingview.dimstack.util.SiteConfigUtil;

import java.text.SimpleDateFormat;
import java.util.Date;

@Service
@Slf4j
public class LoginServiceImpl implements LoginService {

    @Autowired
    private LoginMapper loginMapper;

    @Autowired
    private CacheService cacheService;

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

    @Override
    public LoginResponseDTO login(LoginDTO loginDTO, HttpServletRequest request) {
        HttpSession session = request.getSession();

        String username = loginDTO.getUsername();
        String password = loginDTO.getPassword();
        String captcha = loginDTO.getCaptcha();
        String captchaKey = loginDTO.getCaptchaKey();

        if (username == null || username.trim().isEmpty()) {
            LoginResponseDTO dto = new LoginResponseDTO();
            dto.setSuccess(false);
            dto.setMessage("用户名不能为空");
            dto.setCode(400);
            return dto;
        }
        if (password == null || password.isEmpty()) {
            LoginResponseDTO dto = new LoginResponseDTO();
            dto.setSuccess(false);
            dto.setMessage("密码不能为空");
            dto.setCode(400);
            return dto;
        }
        if (captcha == null || captcha.isEmpty()) {
            LoginResponseDTO dto = new LoginResponseDTO();
            dto.setSuccess(false);
            dto.setMessage("验证码不能为空");
            dto.setCode(400);
            return dto;
        }
        if (captchaKey == null || captchaKey.isEmpty()) {
            LoginResponseDTO dto = new LoginResponseDTO();
            dto.setSuccess(false);
            dto.setMessage("验证码无效");
            dto.setCode(400);
            return dto;
        }

        String sessionCaptchaKey = (String) session.getAttribute(SESSION_CAPTCHA_KEY_ATTR);
        String currentSessionId = session.getId();

        log.info("登录请求 - Session ID: {}, 请求 captchaKey: {}, Session captchaKey: {}",
                currentSessionId, captchaKey, sessionCaptchaKey);

        if (sessionCaptchaKey == null || !sessionCaptchaKey.equals(captchaKey)) {
            log.warn("验证码 key 不匹配 - Session: {}, 请求: {}", sessionCaptchaKey, captchaKey);
            cleanUpCaptcha(session, CAPTCHA_PREFIX + captchaKey);
            LoginResponseDTO dto = new LoginResponseDTO();
            dto.setSuccess(false);
            dto.setMessage("验证码无效或已过期，请重新获取");
            dto.setCode(400);
            return dto;
        }

        String redisCaptchaKey = CAPTCHA_PREFIX + captchaKey;
        String redisCaptcha = cacheService.get(redisCaptchaKey, String.class);

        if (redisCaptcha == null) {
            log.warn("Redis 中无验证码 - key: {}", redisCaptchaKey);
            cleanUpCaptcha(session, redisCaptchaKey);
            LoginResponseDTO dto = new LoginResponseDTO();
            dto.setSuccess(false);
            dto.setMessage("验证码已过期，请重新获取");
            dto.setCode(400);
            return dto;
        }

        if (!CaptchaUtil.validateCaptcha(redisCaptcha, captcha)) {
            log.warn("验证码错误 - 输入: {}, 正确: {}", captcha, redisCaptcha);
            cleanUpCaptcha(session, redisCaptchaKey);
            LoginResponseDTO dto = new LoginResponseDTO();
            dto.setSuccess(false);
            dto.setMessage("验证码错误");
            dto.setCode(400);
            return dto;
        }

        cleanUpCaptcha(session, redisCaptchaKey);
        log.info("验证码校验通过，已立即删除 - key: {}", redisCaptchaKey);

        var login = new Login();
        login.setUsername(username);
        login.setPassword(password);

        var result = loginMapper.loginUser(login);
        if (result == null || !PasswordUtil.checkPassword(password, result.getPassword())) {
            LoginResponseDTO dto = new LoginResponseDTO();
            dto.setSuccess(false);
            dto.setMessage("用户名或密码错误");
            dto.setCode(401);
            return dto;
        }

        session.invalidate();
        session = request.getSession(true);

        session.setAttribute("username", username);
        session.setAttribute("isLoggedIn", true);
        session.setAttribute("loginTime", System.currentTimeMillis());
        session.setAttribute("userAgent", request.getHeader("User-Agent"));

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

        LoginResponseDTO dto = new LoginResponseDTO();
        dto.setSuccess(true);
        dto.setMessage("登录成功");
        dto.setCode(200);
        return dto;
    }

    @Override
    public void logout(HttpSession session) {
        String username = (String) session.getAttribute("username");
        session.invalidate();
        log.info("用户 {} 登出成功", username != null ? username : "Unknown");
    }

    private void cleanUpCaptcha(HttpSession session, String redisCaptchaKey) {
        try {
            cacheService.delete(redisCaptchaKey);
            session.removeAttribute(SESSION_CAPTCHA_KEY_ATTR);
            log.debug("已清理验证码 - Cache Key: {}, Session Attribute: {}", redisCaptchaKey, SESSION_CAPTCHA_KEY_ATTR);
        } catch (Exception e) {
            log.warn("清理验证码时发生异常", e);
        }
    }
}