package xyz.lingview.dimstack.dto;

import lombok.Data;

@Data
public class AddCommentRequest {
    private String article_alias;
    private String content;
    private String to_comment_id;
}
