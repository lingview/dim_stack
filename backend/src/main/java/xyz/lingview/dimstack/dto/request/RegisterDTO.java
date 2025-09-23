package xyz.lingview.dimstack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * @Auther: lingview
 * @Date: 2025/09/22
 * @Description: 用户注册请求 DTO
 */
@Data
public class RegisterDTO {

    @NotBlank(message = "用户名不能为空")
    private String username;

    private String email;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @NotBlank(message = "密码不能为空")
    private String password;

    @NotBlank(message = "验证码不能为空")
    private String captcha;

    @NotBlank(message = "验证码标识符不能为空")
    private String captchaKey;

}