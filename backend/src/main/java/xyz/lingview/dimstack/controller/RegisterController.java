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
import xyz.lingview.dimstack.mapper.SiteConfigMapper;
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

    @Autowired
    SiteConfigMapper siteConfigMapper;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> requestData) {
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

            String redisCaptcha = redisTemplate.opsForValue().get("captcha_" + captchaKey);
            if (redisCaptcha == null) {
                return fail("验证码已过期，请重新获取", HttpStatus.BAD_REQUEST);
            }

            if (!CaptchaUtil.validateCaptcha(redisCaptcha, captcha)) {
                clearCaptcha(captchaKey);
                return fail("验证码错误", HttpStatus.BAD_REQUEST);
            }

            clearCaptcha(captchaKey);

            log.info("注册用户名：{} 手机号：{} 邮箱：{}", username, phone, email);

            int userExists = registerMapper.selectUser(username);
            if (userExists > 0) {
                return fail("账号已存在！", HttpStatus.BAD_REQUEST);
            }

            Register register = new Register();
            register.setUsername(username);
            register.setEmail(email);
            register.setPhone(phone);
            register.setUuid(RandomUtil.generateUUID());
            register.setPassword(PasswordUtil.hashPassword(password));
            Integer userDefaultPermission = siteConfigMapper.getRegisterUserPermission();
            if (userDefaultPermission == null) {
                return fail("系统配置错误，请联系管理员", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            register.setRole_id(userDefaultPermission);

            int insertResult = registerMapper.insertUser(register);
            if (insertResult > 0) {
                return success("注册成功！");
            } else {
                return fail("注册失败，请稍后再试", HttpStatus.INTERNAL_SERVER_ERROR);
            }

        } catch (Exception e) {
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

    private void clearCaptcha(String captchaKey) {
        redisTemplate.delete("captcha_" + captchaKey);
        log.info("已清理验证码: {}", captchaKey);
    }
}