package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.domain.Register;
import xyz.lingview.dimstack.mapper.RegisterMapper;
import xyz.lingview.dimstack.util.PasswordUtil;
import xyz.lingview.dimstack.util.RandomUtil;
import xyz.lingview.dimstack.util.CaptchaUtil;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api")
@Slf4j
public class RegisterController {

    @Autowired
    private RegisterMapper registerMapper;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> requestData, HttpSession session) {
        try {
            String username = (String) requestData.get("username");
            String email = (String) requestData.get("email");
            String phone = (String) requestData.get("phone");
            String password = (String) requestData.get("password");
            String captcha = (String) requestData.get("captcha");
            String captchaKey = (String) requestData.get("captchaKey");

            if (isBlank(username)) return fail("用户名不能为空", HttpStatus.BAD_REQUEST);
            if (isBlank(password)) return fail("密码不能为空", HttpStatus.BAD_REQUEST);
            if (isBlank(captcha)) return fail("验证码不能为空", HttpStatus.BAD_REQUEST);
            if (isBlank(captchaKey)) return fail("验证码无效", HttpStatus.BAD_REQUEST);

            // 检查验证码是否与session中一致
            String sessionCaptchaKey = (String) session.getAttribute("captchaKey");
            String sessionId = session.getId();
            log.info("注册验证 - 当前 Session ID: {}", sessionId);
            log.info("注册验证 - 请求中的 captchaKey: {}", captchaKey);
            log.info("注册验证 - Session 中的 captchaKey: {}", sessionCaptchaKey);

            if (sessionCaptchaKey == null || !sessionCaptchaKey.equals(captchaKey)) {
                return fail("验证码无效或已过期，请重新获取", HttpStatus.BAD_REQUEST);
            }

            String redisCaptcha = redisTemplate.opsForValue().get("captcha_" + captchaKey);
            log.info("从 Redis 获取验证码: captcha_{} = {}", captchaKey, redisCaptcha);

            if (redisCaptcha == null) {
                return fail("验证码已过期，请重新获取", HttpStatus.BAD_REQUEST);
            }

            if (!CaptchaUtil.validateCaptcha(redisCaptcha, captcha)) {
                clearCaptcha(session, captchaKey);
                return fail("验证码错误", HttpStatus.BAD_REQUEST);
            }

            // 注册成功后设置验证码 10 秒自动过期（解决 react18 开发环境双请求问题）
            redisTemplate.expire("captcha_" + captchaKey, 10, TimeUnit.SECONDS);

            log.info("注册用户名：{} 手机号：{} 邮箱：{}", username, phone, email);

            // 防止 React 18 双重请求 - 设置注册中标记
            String registeringKey = "registering_" + username;
            Boolean alreadyRegistering = redisTemplate.opsForValue()
                    .setIfAbsent(registeringKey, "true", 5, TimeUnit.SECONDS);

            if (alreadyRegistering != null && !alreadyRegistering) {
                // 如果正在处理相同请求，检查是否已注册成功
                if ("true".equals(redisTemplate.opsForValue().get("registered_" + username))) {
                    return success("注册成功！");
                }
            }

            // 检查用户是否已存在
            int userExists = registerMapper.selectUser(username);
            if (userExists > 0) {
                String registeredFlag = redisTemplate.opsForValue().get("registered_" + username);
                if ("true".equals(registeredFlag)) {
                    redisTemplate.delete(registeringKey);
                    return success("注册成功！");
                } else {
                    redisTemplate.delete(registeringKey);
                    return fail("账号已存在！", HttpStatus.BAD_REQUEST);
                }
            }

            // 插入用户
            Register register = new Register();
            register.setUsername(username);
            register.setEmail(email);
            register.setPhone(phone);
            register.setUuid(RandomUtil.generateUUID());
            register.setPassword(PasswordUtil.hashPassword(password));

            int insertResult = registerMapper.insertUser(register);
            log.info("插入结果：{}", insertResult);

            if (insertResult > 0) {
                redisTemplate.opsForValue().set("registered_" + username, "true", 10, TimeUnit.SECONDS);
                redisTemplate.delete(registeringKey);
                return success("注册成功！");
            } else {
                redisTemplate.delete(registeringKey);
                return fail("注册失败，请稍后再试", HttpStatus.INTERNAL_SERVER_ERROR);
            }

        } catch (Exception e) {
            String sessionCaptchaKey = (String) session.getAttribute("captchaKey");
            if (sessionCaptchaKey != null) {
                clearCaptcha(session, sessionCaptchaKey);
            }
            log.error("注册过程中发生错误", e);
            return fail("注册失败，请检查输入或稍后再试", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private ResponseEntity<Map<String, Object>> success(String message) {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> data = new HashMap<>();
        data.put("success", true);
        data.put("message", message);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> fail(String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> data = new HashMap<>();
        data.put("success", false);
        data.put("message", message);
        response.put("data", data);
        return ResponseEntity.status(status).body(response);
    }

    private void clearCaptcha(HttpSession session, String captchaKey) {
        redisTemplate.delete("captcha_" + captchaKey);
        session.removeAttribute("captchaKey");
        log.info("已清理验证码和 Session 中的 captchaKey");
    }
}
