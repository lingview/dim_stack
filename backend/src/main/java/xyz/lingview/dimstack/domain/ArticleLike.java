package xyz.lingview.dimstack.domain;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ArticleLike {
    private Integer id;
    private String user_id;
    private String article_id;
    private LocalDateTime create_time;
}
