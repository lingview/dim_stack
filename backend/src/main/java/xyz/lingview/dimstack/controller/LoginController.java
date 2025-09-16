package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.domain.Login;
import xyz.lingview.dimstack.mapper.LoginMapper;
import xyz.lingview.dimstack.util.CaptchaUtil;
import xyz.lingview.dimstack.util.PasswordUtil;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;


@Slf4j
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    private LoginMapper loginMapper;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String CAPTCHA_PREFIX = "captcha_";
    private static final String SESSION_CAPTCHA_KEY_ATTR = "captchaKey";

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, Object> requestData,
            HttpServletRequest httpRequest,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();
        Map<String, Object> data = new HashMap<>();

        try {
            String username = (String) requestData.get("username");
            String password = (String) requestData.get("password");
            String captcha = (String) requestData.get("captcha");
            String captchaKey = (String) requestData.get("captchaKey");

            if (username == null || username.trim().isEmpty()) {
                return errorResponse("用户名不能为空");
            }
            if (password == null || password.isEmpty()) {
                return errorResponse("密码不能为空");
            }
            if (captcha == null || captcha.isEmpty()) {
                return errorResponse("验证码不能为空");
            }
            if (captchaKey == null || captchaKey.isEmpty()) {
                return errorResponse("验证码无效");
            }

            String sessionCaptchaKey = (String) session.getAttribute(SESSION_CAPTCHA_KEY_ATTR);
            String currentSessionId = session.getId();

            log.info("登录请求 - Session ID: {}, 请求 captchaKey: {}, Session captchaKey: {}",
                    currentSessionId, captchaKey, sessionCaptchaKey);

            if (sessionCaptchaKey == null || !sessionCaptchaKey.equals(captchaKey)) {
                log.warn("验证码 key 不匹配 - Session: {}, 请求: {}", sessionCaptchaKey, captchaKey);
                return errorResponse("验证码无效或已过期，请重新获取");
            }

            String redisCaptchaKey = CAPTCHA_PREFIX + captchaKey;
            String redisCaptcha = redisTemplate.opsForValue().get(redisCaptchaKey);

            if (redisCaptcha == null) {
                log.warn("Redis 中无验证码 - key: {}", redisCaptchaKey);
                cleanUpCaptcha(session, redisCaptchaKey);
                return errorResponse("验证码已过期，请重新获取");
            }

            if (!CaptchaUtil.validateCaptcha(redisCaptcha, captcha)) {
                log.warn("验证码错误 - 输入: {}, 正确: {}", captcha, redisCaptcha);
                cleanUpCaptcha(session, redisCaptchaKey);
                return errorResponse("验证码错误");
            }

            cleanUpCaptcha(session, redisCaptchaKey);
            log.info("验证码校验通过，已立即删除 - key: {}", redisCaptchaKey);

            Login login = new Login();
            login.setUsername(username);
            login.setPassword(password);

            Login result = loginMapper.loginUser(login);
            if (result == null) {
                return unauthorizedResponse("用户名或密码错误");
            }

            if (!PasswordUtil.checkPassword(password, result.getPassword())) {
                return unauthorizedResponse("用户名或密码错误");
            }

            session.invalidate();
            HttpSession newSession = httpRequest.getSession(true);
            newSession.setAttribute("username", username);
            newSession.setAttribute("isLoggedIn", true);
            newSession.setAttribute("loginTime", System.currentTimeMillis());

            log.info("用户 {} 登录成功，新 Session ID: {}", username, newSession.getId());

            data.put("success", true);
            data.put("message", "登录成功");
            response.put("data", data);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("登录过程发生未知错误", e);
            data.put("success", false);
            data.put("message", "登录失败，请稍后再试");
            response.put("data", data);
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        String username = (String) session.getAttribute("username");
        session.invalidate();
        log.info("用户 {} 登出成功", username);

        Map<String, Object> data = Map.of("success", true, "message", "登出成功");
        Map<String, Object> response = Map.of("data", data);
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> errorResponse(String message) {
        Map<String, Object> data = Map.of("success", false, "message", message);
        Map<String, Object> response = Map.of("data", data);
        return ResponseEntity.badRequest().body(response);
    }

    private ResponseEntity<Map<String, Object>> unauthorizedResponse(String message) {
        Map<String, Object> data = Map.of("success", false, "message", message);
        Map<String, Object> response = Map.of("data", data);
        return ResponseEntity.status(401).body(response);
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