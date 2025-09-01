package xyz.lingview.dimstack.domain;

import lombok.Data;

@Data
public class SiteConfig {
    private Integer id;
    private String site_name;
    private String register_user_permission;
    private String copyright;
}
