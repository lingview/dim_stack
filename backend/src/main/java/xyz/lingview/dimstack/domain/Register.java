package xyz.lingview.dimstack.domain;

import lombok.Data;

@Data
public class Register {
    private String uuid;
    private String username;
    private String avatar;
    private String phone;
    private String email;
    private String password;
    private String status;
}
