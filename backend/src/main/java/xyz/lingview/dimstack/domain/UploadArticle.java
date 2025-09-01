package xyz.lingview.dimstack.domain;

import lombok.Data;

@Data
public class UploadArticle {
    private String uuid;
    private String article_id;
    private String article_name;
    private String article_cover;
    private String article_content;
    private String tags;
    private String category;
    private String alias;
    private int status;
}
