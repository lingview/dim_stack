package xyz.lingview.dimstack.dto.request;

import lombok.Data;

@Data
public class UserUpdateDTO {
    private String uuid;
    private String username;
    private String avatar;
    private String phone;
    private String email;
    private String gender;
    private String password;
    private String birthday;
}
