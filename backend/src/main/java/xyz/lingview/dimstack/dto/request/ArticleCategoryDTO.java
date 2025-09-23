package xyz.lingview.dimstack.dto.request;

import lombok.Data;

@Data
public class ArticleCategoryDTO {
    private Integer id;
    private String category_name;
    private String category_explain;
    private String founder;
    private String create_time;
    private Integer status;
}
