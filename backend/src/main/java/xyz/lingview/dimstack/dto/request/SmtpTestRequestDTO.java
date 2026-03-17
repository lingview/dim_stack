package xyz.lingview.dimstack.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SmtpTestRequestDTO {
    @NotBlank(message = "SMTP主机不能为空")
    private String smtp_host;

    private Integer smtp_port;

    @NotBlank(message = "发件人邮箱不能为空")
    @Email(message = "发件人邮箱格式不正确")
    private String mail_sender_email;

    @NotBlank(message = "发件人名称不能为空")
    private String mail_sender_name;

    @NotBlank(message = "SMTP用户名不能为空")
    private String mail_username;

    @NotBlank(message = "SMTP密码不能为空")
    private String mail_password;

    @NotBlank(message = "协议不能为空")
    private String mail_protocol;

    private Boolean mail_enable_tls;

    private Boolean mail_enable_ssl;

    @NotBlank(message = "测试收件邮箱不能为空")
    @Email(message = "测试收件邮箱格式不正确")
    private String test_email;
}
