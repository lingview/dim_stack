package xyz.lingview.dimstack.domain;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Date;

@Data
public class UserInformation {
    private Integer id;
    private String uuid;
    private String username;
    private String avatar;
    private String phone;
    private String email;
    private String gender;
    private String password;
    private Date birthday;
    private Integer role_id;
    private LocalDateTime create_time;
    private Byte status;
}
