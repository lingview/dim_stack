package xyz.lingview.dimstack.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.Register;
import xyz.lingview.dimstack.dto.request.RegisterDTO;
import xyz.lingview.dimstack.dto.response.RegisterResponseDTO;
import xyz.lingview.dimstack.mapper.RegisterMapper;
import xyz.lingview.dimstack.mapper.SiteConfigMapper;
import xyz.lingview.dimstack.util.PasswordUtil;
import xyz.lingview.dimstack.util.RandomUtil;
import xyz.lingview.dimstack.util.CaptchaUtil;

import java.util.HashMap;
import java.util.Map;

/**
 * @Auther: lingview
 * @Date: 2025/08/26 22:57:54
 * @Description: 用户注册控制器
 */
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

    /**
     * 用户注册接口
     *
     * @param requestDTO 包含注册所需信息的请求体，必须包含以下字段：
     *                    - username: 用户名（非空）
     *                    - email: 邮箱（可选）
     *                    - phone: 手机号（可选）
     *                    - password: 密码（非空）
     *                    - captcha: 验证码（非空）
     *                    - captchaKey: 验证码标识符（非空）
     * @return ResponseEntity<Map<String, Object>> 注册结果响应：
     *         - 成功：状态码200，返回包含"success": true和"message": "注册成功！"的JSON数据
     *         - 失败：根据具体错误返回相应状态码和错误信息：
     *           - 400：请求参数验证失败（如用户名、密码或验证码为空，验证码错误，账号已存在等）
     *           - 500：服务器内部错误（如系统配置错误、数据库插入失败等）
     */
    @PostMapping("/register")
    public ApiResponse<RegisterResponseDTO> register(@RequestBody @Valid RegisterDTO requestDTO, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            return ApiResponse.error(400, errorMsg);
        }

        try {
            String username = requestDTO.getUsername();
            String email = requestDTO.getEmail();
            String phone = requestDTO.getPhone();
            String password = requestDTO.getPassword();
            String captcha = requestDTO.getCaptcha();
            String captchaKey = requestDTO.getCaptchaKey();

            if (isBlank(username)) return ApiResponse.error(400, "用户名不能为空");
            if (isBlank(password)) return ApiResponse.error(400, "密码不能为空");
            if (isBlank(captcha)) return ApiResponse.error(400, "验证码不能为空");
            if (isBlank(captchaKey)) return ApiResponse.error(400, "验证码无效");

            String redisCaptcha = redisTemplate.opsForValue().get("captcha_" + captchaKey);
            if (redisCaptcha == null) {
                return ApiResponse.error(400, "验证码已过期，请重新获取");
            }

            if (!CaptchaUtil.validateCaptcha(redisCaptcha, captcha)) {
                clearCaptcha(captchaKey);
                return ApiResponse.error(400, "验证码错误");
            }

            clearCaptcha(captchaKey);

            log.info("注册用户名：{} 手机号：{} 邮箱：{}", username, phone, email);

            int userExists = registerMapper.selectUser(username);
            if (userExists > 0) {
                return ApiResponse.error(400, "账号已存在！");
            }

            Register register = new Register();
            register.setUsername(username);
            register.setEmail(email);
            register.setPhone(phone);
            register.setUuid(RandomUtil.generateUUID());
            register.setPassword(PasswordUtil.hashPassword(password));
            Integer userDefaultPermission = siteConfigMapper.getRegisterUserPermission();
            if (userDefaultPermission == null) {
                return ApiResponse.error(500, "系统配置错误，请联系管理员");
            }
            register.setRole_id(userDefaultPermission);

            int insertResult = registerMapper.insertUser(register);
            if (insertResult > 0) {
                RegisterResponseDTO data = new RegisterResponseDTO();
                data.setSuccess(true);
                data.setMessage("注册成功！");
                return ApiResponse.success(data);
            } else {
                return ApiResponse.error(500, "注册失败，请稍后再试");
            }

        } catch (Exception e) {
            log.error("注册过程中发生错误", e);
            return ApiResponse.error(500, "注册失败，请检查输入或稍后再试");
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