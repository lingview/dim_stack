package xyz.lingview.dimstack.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ArticleReviewDTO {
    private String article_id;
    private String article_name;
    private String uuid;
    private String author_name;
    private String excerpt;
    private LocalDateTime create_time;
    private String tag;
    private String category;
    private Byte status;
}
