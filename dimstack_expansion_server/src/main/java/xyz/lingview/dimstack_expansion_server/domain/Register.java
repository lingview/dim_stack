package xyz.lingview.dimstack_expansion_server.domain;

import lombok.Data;

@Data
public class Register {
    private String uuid;
    private String username;
    private String avatar;
    private String phone;
    private String email;
    private String password;
    private int role_id;
    private String status;
}
