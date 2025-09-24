package xyz.lingview.dimstack_expansion_server.domain;

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
}
