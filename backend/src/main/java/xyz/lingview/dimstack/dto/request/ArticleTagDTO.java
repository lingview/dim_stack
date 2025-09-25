package xyz.lingview.dimstack.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ArticleTagDTO {
    private Integer id;
    @Pattern(regexp = "^[\\u4e00-\\u9fa5a-zA-Z0-9]+$", message = "标签名称只能包含中文、英文和数字")
    private String tag_name;
    private String tag_explain;
    private String founder;
    private String create_time;
    private Integer status;
}
