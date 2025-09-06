package xyz.lingview.dimstack.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ArticleCategoryAndCount {
    private Integer id;
    private String article_categories;
    private String categories_explain;
    private String founder;
    private LocalDateTime create_time;
    private Integer status;
    private Long articleCount;
}
