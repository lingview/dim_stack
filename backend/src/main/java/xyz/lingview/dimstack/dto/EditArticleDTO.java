package xyz.lingview.dimstack.dto;

import lombok.Data;

import java.util.Date;

@Data
public class EditArticleDTO {
    private String article_id;
    private String article_name;
    private String alias;
    private String author_name;
    private Date create_time;
    private Integer status;
    private String password;
    private boolean hasPassword;

    public boolean isHasPassword() {
        return password != null && !password.isEmpty();
    }
}
