package xyz.lingview.dimstack.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * @Author: lingview
 * @Date: 2026/01/17 20:08:58
 * @Description: 自定义页面响应体
 * @Version: 1.0
 */
@Data
public class CustomPageResponse {
    private Integer id;
    private String pageName;
    private String pageCode;
    private String alias;
    private String creatorUsername;
    private LocalDateTime createTime;
    private Integer status;
}
