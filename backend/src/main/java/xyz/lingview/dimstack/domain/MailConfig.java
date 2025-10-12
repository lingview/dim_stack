package xyz.lingview.dimstack.domain;

import lombok.Data;

@Data
public class MailConfig {
    private String smtp_host;
    private Integer smtp_port;
    private String mail_sender_email;
    private String mail_sender_name;
    private String mail_username;
    private String mail_password;
    private String mail_protocol;
    private Boolean mail_enable_tls;
    private Boolean mail_enable_ssl;
    private String mail_default_encoding;
}
