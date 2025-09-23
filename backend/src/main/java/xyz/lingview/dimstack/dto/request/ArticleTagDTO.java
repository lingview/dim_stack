package xyz.lingview.dimstack.dto.request;

import lombok.Data;

@Data
public class ArticleTagDTO {
    private Integer id;
    private String tag_name;
    private String tag_explain;
    private String founder;
    private String create_time;
    private Integer status;
}
