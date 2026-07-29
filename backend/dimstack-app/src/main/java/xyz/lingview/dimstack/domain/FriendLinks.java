package xyz.lingview.dimstack.domain;

import lombok.Data;

import java.util.Date;

/**
 * @Author: lingview
 * @Date: 2025/12/04 19:18:05
 * @Description: 友链表实体映射
 * @Version: 1.0
 */
@Data
public class FriendLinks {
    private Integer id;
    private String uuid;
    private String siteName;
    private String siteUrl;
    private String siteIcon;
    private String siteDescription;
    private String webmasterName;
    private String contact;
    private Date createTime;
    private Integer status;
}