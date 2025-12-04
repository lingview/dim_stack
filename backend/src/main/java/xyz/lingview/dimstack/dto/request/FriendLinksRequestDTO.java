package xyz.lingview.dimstack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * @Author: lingview
 * @Date: 2025/12/04 19:49:24
 * @Description: 友链请求实体
 * @Version: 1.0
 */
@Data
public class FriendLinksRequestDTO {
    @NotBlank(message = "站点名称不能为空")
    private String siteName;

    @NotBlank(message = "站点URL不能为空")
    @Pattern(regexp = "^https?://.+", message = "站点URL格式不正确")
    private String siteUrl;

    private String siteIcon;

    @NotBlank(message = "站点介绍不能为空")
    private String siteDescription;

    @NotBlank(message = "站长名称不能为空")
    private String webmasterName;

    @NotBlank(message = "联系方式不能为空")
    private String contact;
}