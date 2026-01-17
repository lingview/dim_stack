package xyz.lingview.dimstack.domain;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * @Author: lingview
 * @Date: 2026/01/17 20:09:44
 * @Description:
 * @Version: 1.0
 */
@Data
public class CustomPage {
    private Integer id;
    private String uuid;
    private String pageName;
    private String pageCode;
    private String alias;
    private LocalDateTime createTime;
    private Integer status;
}