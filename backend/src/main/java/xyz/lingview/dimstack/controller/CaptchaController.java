package xyz.lingview.dimstack.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.redis.core.StringRedisTemplate;
import xyz.lingview.dimstack.util.CaptchaUtil;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api")
public class CaptchaController {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @GetMapping("/captcha")
    public Map<String, Object> getCaptcha(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        // 生成新的验证码
        String captcha = CaptchaUtil.generateCaptcha(4);
        String captchaKey = CaptchaUtil.generateCaptchaKey();
        System.out.println("生成验证码: " + captcha);

        // 删除旧的验证码（如果存在）
        String oldCaptchaKey = (String) session.getAttribute("captchaKey");
        if (oldCaptchaKey != null) {
            Boolean deleted = redisTemplate.delete("captcha_" + oldCaptchaKey);
            System.out.println("Redis删除旧验证码: captcha_" + oldCaptchaKey + ", 结果: " + deleted);
        }

        // 保存新的验证码到Redis（有效期5分钟）
        redisTemplate.opsForValue().set("captcha_" + captchaKey, captcha.toLowerCase(), 5, TimeUnit.MINUTES);
        System.out.println("Redis保存验证码: captcha_" + captchaKey + " = " + captcha.toLowerCase());

        // 存储新的验证码key到session
        session.setAttribute("captchaKey", captchaKey);
        System.out.println("Session设置captchaKey: " + captchaKey);

        // 输出SessionID
        String sessionId = session.getId();
        System.out.println("验证码生成 - Session ID: " + sessionId);
        System.out.println("验证码生成 - 新key: " + captchaKey + ", 旧key: " + oldCaptchaKey);

        // 生成验证码图片
        String captchaImage = CaptchaUtil.generateCaptchaImage(captcha);

        response.put("success", true);
        response.put("image", "data:image/png;base64," + captchaImage);
        response.put("key", captchaKey);
        response.put("sessionId", "******");

        return response;
    }
}
