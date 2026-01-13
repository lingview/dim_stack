package xyz.lingview.dimstack.dto.response;

import lombok.Data;

/**
 * @Author: lingview
 * @Date: 2026/01/13 19:09:21
 * @Description: 密码找回响应体
 * @Version: 1.0
 */
@Data
public class ForgotPasswordResponseDTO {
    private Boolean success;
    private String message;
}