package xyz.lingview.dimstack.domain;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentLike {
    private Integer id;
    private String user_id;
    private String comment_id;
    private LocalDateTime create_time;
}
