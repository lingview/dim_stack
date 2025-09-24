package xyz.lingview.dimstack_expansion_server.dto.request;

import lombok.Data;

@Data
public class LoginDTO {
    private String username;
    private String password;
    private String captcha;
    private String captchaKey;
}
