package xyz.lingview.dimstack.dto;

import lombok.Data;

@Data
public class ArticleDetailDTO {
    private String article_id;
    private String article_name;
    private String article_cover;
    private String excerpt;
    private String article_content;
    private String password;
    private String tag;
    private String category;
    private String alias;
    private Integer status;
}
