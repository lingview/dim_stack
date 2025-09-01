package xyz.lingview.dimstack.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ArticleTag {
    private Integer id;
    private String tag_name;
    private String tag_explain;
    private String founder;
    private LocalDateTime create_time;
    private Integer status;
}
