package xyz.lingview.dimstack.domain;

import lombok.Data;

@Data
public class SiteConfig {
    private Integer id;
    private String siteName;
    private String registerUserPermission;
    private String copyright;
}
