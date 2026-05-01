package xyz.lingview.dimstack.domain;

import lombok.Data;

import java.util.Date;

@Data
public class FriendLinksConfig {
    private Integer id;
    private String siteName;
    private String siteUrl;
    private String siteLogo;
    private String description;
    private String applyRules;
    private Date createTime;
    private Integer status;
}