package xyz.lingview.dimstack.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class ArticleCategoryDTO {
    private Integer id;
    private Integer parent_id;
    private String category_name;
    private String category_explain;
    private String founder;
    private String create_time;
    private Integer status;
    private Integer article_count;
    private String full_path;
    private Integer level;
    private Integer sort_order;
    private List<ArticleCategoryDTO> children;
    private Boolean has_children;
    private String parent_name;
    private Integer child_count;
}
