package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.domain.Login;
import xyz.lingview.dimstack.mapper.LoginMapper;
import xyz.lingview.dimstack.util.PasswordUtil;
import xyz.lingview.dimstack.util.CaptchaUtil;

import jakarta.servlet.http.HttpSession;
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

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> requestData,
                                                     HttpServletRequest httpRequest,
                                                     HttpSession session) {
        Map<String, Object> resp = new HashMap<>();
        Map<String, Object> data = new HashMap<>();

        try {
            String username = (String) requestData.get("username");
            String password = (String) requestData.get("password");
            String captcha = (String) requestData.get("captcha");
            String captchaKey = (String) requestData.get("captchaKey");

            if (username == null || username.trim().isEmpty()) {
                data.put("success", false);
                data.put("message", "用户名不能为空");
                resp.put("data", data);
                return ResponseEntity.badRequest().body(resp);
            }

            if (password == null || password.isEmpty()) {
                data.put("success", false);
                data.put("message", "密码不能为空");
                resp.put("data", data);
                return ResponseEntity.badRequest().body(resp);
            }

            if (captcha == null || captcha.isEmpty()) {
                data.put("success", false);
                data.put("message", "验证码不能为空");
                resp.put("data", data);
                return ResponseEntity.badRequest().body(resp);
            }

            if (captchaKey == null || captchaKey.isEmpty()) {
                data.put("success", false);
                data.put("message", "验证码无效");
                resp.put("data", data);
                return ResponseEntity.badRequest().body(resp);
            }

            String sessionCaptchaKey = (String) session.getAttribute("captchaKey");
            String sessionId = session.getId();

            log.info("登录验证 - 当前 Session ID:{}", sessionId);
            log.info("登录验证 - 请求中的 captchaKey: {}", captchaKey);
            log.info("登录验证 - Session 中的 captchaKey: {}", sessionCaptchaKey);

            if (sessionCaptchaKey == null || !sessionCaptchaKey.equals(captchaKey)) {
                log.warn("登录验证失败 - 验证码key不匹配");
                data.put("success", false);
                data.put("message", "验证码无效或已过期，请重新获取");
                resp.put("data", data);
                return ResponseEntity.badRequest().body(resp);
            }

            String redisCaptcha = redisTemplate.opsForValue().get("captcha_" + captchaKey);
            log.info("从 Redis 获取验证码: captcha_{} = {}", captchaKey, redisCaptcha);

            if (redisCaptcha == null) {
                data.put("success", false);
                data.put("message", "验证码已过期，请重新获取");
                resp.put("data", data);
                return ResponseEntity.badRequest().body(resp);
            }

            if (!CaptchaUtil.validateCaptcha(redisCaptcha, captcha)) {
                redisTemplate.delete("captcha_" + captchaKey);
                session.removeAttribute("captchaKey");
                log.warn("验证码错误，删除Redis验证码和Session中的captchaKey");

                data.put("success", false);
                data.put("message", "验证码错误");
                resp.put("data", data);
                return ResponseEntity.badRequest().body(resp);
            }

            // 登录成功后设置验证码 10 秒自动过期（解决react18开发环境双请求问题）
            redisTemplate.expire("captcha_" + captchaKey, 10, TimeUnit.SECONDS);

            Login login = new Login();
            login.setUsername(username);
            login.setPassword(password);

            Login result = loginMapper.loginUser(login);
            if (result == null) {
                data.put("success", false);
                data.put("message", "用户名或密码错误");
                resp.put("data", data);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(resp);
            }

            if (!PasswordUtil.checkPassword(password, result.getPassword())) {
                data.put("success", false);
                data.put("message", "用户名或密码错误");
                resp.put("data", data);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(resp);
            }

            // 防止SessionFixation攻击
            session.invalidate();
            HttpSession newSession = httpRequest.getSession(true);

            newSession.setAttribute("username", username);
            newSession.setAttribute("isLoggedIn", true);
            newSession.setAttribute("loginTime", System.currentTimeMillis());

            log.info("用户 {} 登录成功，新 Session ID: {}", username, newSession.getId());

            data.put("success", true);
            data.put("message", "登录成功");
            resp.put("data", data);
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            log.error("登录过程中发生错误", e);
            data.put("success", false);
            data.put("message", "登录失败，请检查输入或稍后再试");
            resp.put("data", data);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> data = new HashMap<>();
        session.invalidate();
        data.put("success", true);
        data.put("message", "登出成功");
        response.put("data", data);
        return ResponseEntity.ok(response);
    }
}
