package xyz.lingview.dimstack.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ArticleCategory {
    private Integer id;
    private Integer parent_id;
    private String article_categories;
    private String categories_explain;
    private String founder;
    private LocalDateTime create_time;
    private Integer status;
    private Integer article_count;
    private String full_path;
    private Integer level;
    private Integer sort_order;
}
