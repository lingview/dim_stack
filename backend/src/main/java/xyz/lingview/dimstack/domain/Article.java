package xyz.lingview.dimstack.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Article {
    private Integer id;
    private String uuid;
    private String article_id;
    private String article_name;
    private String article_cover;
    private String excerpt;
    private String article_content;
    private Long page_views;
    private Long like_count;
    private Long favorite_count;
    private String password;
    private String tag;
    private String category;
    private String alias;
    private LocalDateTime create_time;
    private Byte status;
}
