package xyz.lingview.dimstack.domain;

import lombok.Data;

@Data
public class UploadArticle {
    private String uuid;
    private String article_id;
    private String article_name;
    private String article_path;
    private int status;
}
