package xyz.lingview.dimstack.dto.request;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Date;

@Data
public class UserDTO {
    private Integer id;
    private String uuid;
    private String username;
    private String avatar;
    private String phone;
    private String email;
    private String gender;
    private Date birthday;
    private Integer role_id;
    private String role_name;
    private String role_code;
    private LocalDateTime create_time;
    private Byte status;
}
