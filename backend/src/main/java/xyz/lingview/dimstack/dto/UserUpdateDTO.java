package xyz.lingview.dimstack.dto;

import lombok.Data;
import java.util.Date;

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
