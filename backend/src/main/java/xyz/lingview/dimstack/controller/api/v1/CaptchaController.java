package xyz.lingview.dimstack.controller.api.v1;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.service.CacheService;

import jakarta.servlet.http.HttpSession;
import xyz.lingview.dimstack.util.CaptchaUtil;
import xyz.lingview.dimstack.common.ApiResponse;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api")
public class CaptchaController {

    @Autowired
    private CacheService cacheService;

    @GetMapping("/captcha")
    public ApiResponse<Map<String, String>> getCaptcha(HttpSession session) {
        try {
            // 生成新的验证码
            String captcha = CaptchaUtil.generateCaptcha(4);
            String captchaKey = CaptchaUtil.generateCaptchaKey();

            // 删除旧的验证码（如果存在）
            String oldCaptchaKey = (String) session.getAttribute("captchaKey");
            if (oldCaptchaKey != null) {
                cacheService.delete("captcha_" + oldCaptchaKey);
            }

            // 保存新验证码到缓存（有效期5分钟）
            cacheService.set("captcha_" + captchaKey, captcha.toLowerCase(), 5, TimeUnit.MINUTES);

            // 存储新的验证码key到session
            session.setAttribute("captchaKey", captchaKey);

            // 生成验证码图片
            String captchaImage = CaptchaUtil.generateCaptchaImage(captcha);

            Map<String, String> responseData = new HashMap<>();
            responseData.put("image", "data:image/png;base64," + captchaImage);
            responseData.put("key", captchaKey);

            return ApiResponse.success(responseData);

        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse<Map<String, String>> response = new ApiResponse<>();
            response.setCode(500);
            response.setMessage("验证码生成失败");
            response.setData(null);
            return response;
        }
    }

}
