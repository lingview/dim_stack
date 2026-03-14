package xyz.lingview.dimstack.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserUpdateDTO {
    private String uuid;
    
    @Pattern(regexp = "^[\\u4e00-\\u9fa5a-zA-Z0-9_]+$", message = "用户名只能包含中文、英文、数字和下划线")
    private String username;
    private String avatar;
    private String phone;
    private String email;
    private String gender;
    private String password;
    private String birthday;
}
