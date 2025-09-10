package xyz.lingview.dimstack.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class CommentDTO {
    private String comment_id;
    private String user_id;
    private String username;
    private String avatar;
    private String content;
    private LocalDateTime create_time;
    private Long comment_like_count;
    private String to_comment_id;
    private String to_comment_user_id;
    private String to_comment_username;
    private String article_id;
    private String article_title;
    private Integer status;

    private List<CommentDTO> children = new ArrayList<>();
}
