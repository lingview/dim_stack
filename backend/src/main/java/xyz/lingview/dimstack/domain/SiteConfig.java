package xyz.lingview.dimstack.domain;

import lombok.Data;

@Data
public class SiteConfig {
    private Integer id;
    private String site_name;
    private String register_user_permission;
    private String copyright;
    private int article_status;
    private String hero_image;
    private String hero_title;
    private String hero_subtitle;
    private String site_icon;
    private String site_theme;
    private String expansion_server;
    private Boolean enable_notification;
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
    private String icp_record_number;
    private String mps_record_number;
    private Integer enable_register;
    private Integer enable_music;
    private Integer admin_post_no_review;
}