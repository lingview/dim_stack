package xyz.lingview.dimstack.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.dto.request.RegisterDTO;
import xyz.lingview.dimstack.dto.response.RegisterResponseDTO;
import xyz.lingview.dimstack.service.RegisterService;

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
    private RegisterService registerService;

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
     * @return ApiResponse<RegisterResponseDTO> 注册结果响应
     */
    @PostMapping("/register")
    public ApiResponse<RegisterResponseDTO> register(@RequestBody @Valid RegisterDTO requestDTO, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            return ApiResponse.error(400, errorMsg);
        }

        try {
            RegisterResponseDTO result = registerService.register(requestDTO);
            if (result.isSuccess()) {
                return ApiResponse.success(result);
            } else {
                return ApiResponse.error(result.getCode(), result.getMessage());
            }
        } catch (Exception e) {
            log.error("注册过程中发生错误", e);
            return ApiResponse.error(500, "注册失败，请检查输入或稍后再试");
        }
    }
}