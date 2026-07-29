package xyz.lingview.dimstack.dto.request;

import lombok.Data;

/**
 * @Author: lingview
 * @Date: 2026/01/13 19:08:42
 * @Description: 密码找回请求体
 * @Version: 1.0
 */
@Data
public class ForgotPasswordDTO {
    private String username;
    private String email;
    private String newPassword;
    private String confirmNewPassword;
    private String captcha;
    private String captchaKey;
}