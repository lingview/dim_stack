package xyz.lingview.dimstack.dto.request;

import lombok.Data;

/**
 * @Author: lingview
 * @Date: 2026/01/17 20:08:28
 * @Description: 自定义页面请求体
 * @Version: 1.0
 */
@Data
public class CustomPageRequest {
    private String pageName;
    private String pageCode;
    private String alias;
    private Integer status;
}