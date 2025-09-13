package xyz.lingview.dimstack.dto;

import lombok.Data;

import java.util.Date;

@Data
public class HotArticleDTO {
    private Integer id;
    private String article_id;
    private String title;
    private String excerpt;
    private String image;
    private Date date;
    private String author;
    private String category;
    private int page_views ;
    private String alias;
}
