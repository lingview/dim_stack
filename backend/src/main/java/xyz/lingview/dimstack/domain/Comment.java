package xyz.lingview.dimstack.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Comment {
    private Integer id;
    private String user_id;
    private String comment_id;
    private String article_id;
    private String root_comment_id;
    private String to_comment_id;
    private LocalDateTime create_time;
    private LocalDateTime update_time;
    private String content;
    private Long comment_like_count;
    private Integer status;
}
