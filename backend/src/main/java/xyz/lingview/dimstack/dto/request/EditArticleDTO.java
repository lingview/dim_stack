package xyz.lingview.dimstack.dto.request;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

@Data
public class EditArticleDTO {
    private String article_id;
    private String article_name;
    private String alias;
    private String author_name;
    private LocalDateTime create_time;
    private Integer status;
    private String password;
    private boolean hasPassword;

    public boolean isHasPassword() {
        return password != null && !password.isEmpty();
    }
}
