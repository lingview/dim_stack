package xyz.lingview.dimstack.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UpdateArticleDTO {
    private String article_id;
    private String article_name;
    private String article_cover;
    private String excerpt;
    private String article_content;
    private String password;
    private String tag;
    private String category;
    private String alias;
    private int status;
    private LocalDateTime create_time;
    private Integer enable_comment;
}
