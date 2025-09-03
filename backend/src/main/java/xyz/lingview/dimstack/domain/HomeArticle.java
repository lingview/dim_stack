package xyz.lingview.dimstack.domain;

import lombok.Data;
import java.util.Date;

@Data
public class HomeArticle {
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
    private Date create_time;
    private Integer status;
}
