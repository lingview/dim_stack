package xyz.lingview.dimstack.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.domain.Login;
import xyz.lingview.dimstack.mapper.LoginMapper;
import xyz.lingview.dimstack.util.PasswordUtil;
import xyz.lingview.dimstack.util.CaptchaUtil;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    private LoginMapper loginMapper;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> requestData,
                                                     HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> data = new HashMap<>();

        try {
            String username = (String) requestData.get("username");
            String password = (String) requestData.get("password");
            String captcha = (String) requestData.get("captcha");
            String captchaKey = (String) requestData.get("captchaKey");

            if (username == null || username.trim().isEmpty()) {
                data.put("success", false);
                data.put("message", "用户名不能为空");
                response.put("data", data);
                return ResponseEntity.badRequest().body(response);
            }

            if (password == null || password.isEmpty()) {
                data.put("success", false);
                data.put("message", "密码不能为空");
                response.put("data", data);
                return ResponseEntity.badRequest().body(response);
            }

            if (captcha == null || captcha.isEmpty()) {
                data.put("success", false);
                data.put("message", "验证码不能为空");
                response.put("data", data);
                return ResponseEntity.badRequest().body(response);
            }

            if (captchaKey == null || captchaKey.isEmpty()) {
                data.put("success", false);
                data.put("message", "验证码无效");
                response.put("data", data);
                return ResponseEntity.badRequest().body(response);
            }

            String sessionCaptchaKey = (String) session.getAttribute("captchaKey");
            String sessionId = session.getId();
            System.out.println("登录验证 - 当前 Session ID: " + sessionId);
            System.out.println("登录验证 - 请求中的captchaKey: " + captchaKey);
            System.out.println("登录验证 - Session中的captchaKey: " + sessionCaptchaKey);

            if (sessionCaptchaKey == null || !sessionCaptchaKey.equals(captchaKey)) {
                System.out.println("登录验证失败 - 验证码key不匹配");
                data.put("success", false);
                data.put("message", "验证码无效或已过期，请重新获取");
                response.put("data", data);
                return ResponseEntity.badRequest().body(response);
            }

            String redisCaptcha = redisTemplate.opsForValue().get("captcha_" + captchaKey);
            System.out.println("从Redis获取验证码: captcha_" + captchaKey + " = " + redisCaptcha);

            if (redisCaptcha == null) {
                data.put("success", false);
                data.put("message", "验证码已过期，请重新获取");
                response.put("data", data);
                return ResponseEntity.badRequest().body(response);
            }

            if (!CaptchaUtil.validateCaptcha(redisCaptcha, captcha)) {
                // 验证码错误立即删除
                redisTemplate.delete("captcha_" + captchaKey);
                session.removeAttribute("captchaKey");
                System.out.println("验证码错误，删除Redis验证码和Session中的captchaKey");

                data.put("success", false);
                data.put("message", "验证码错误");
                response.put("data", data);
                return ResponseEntity.badRequest().body(response);
            }

            // 登录成功后设置验证码 10 秒自动过期（解决react18开发环境双请求问题，等待请求完第二次后再删除）
            redisTemplate.expire("captcha_" + captchaKey, 10, TimeUnit.SECONDS);

            Login login = new Login();
            login.setUsername(username);
            login.setPassword(password);

            Login result = loginMapper.loginUser(login);
            if (result == null) {
                data.put("success", false);
                data.put("message", "用户名或密码错误");
                response.put("data", data);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // 验证密码
            if (!PasswordUtil.checkPassword(password, result.getPassword())) {
                data.put("success", false);
                data.put("message", "用户名或密码错误");
                response.put("data", data);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            session.setAttribute("username", username);
            session.setAttribute("isLoggedIn", true);

            data.put("success", true);
            data.put("message", "登录成功");
            response.put("data", data);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            String sessionCaptchaKey = (String) session.getAttribute("captchaKey");
            if (sessionCaptchaKey != null) {
                redisTemplate.delete("captcha_" + sessionCaptchaKey);
            }
            session.removeAttribute("captchaKey");
            System.out.println("发生异常，清理验证码和Session");

            data.put("success", false);
            data.put("message", "登录失败，请检查输入或稍后再试");
            response.put("data", data);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
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
