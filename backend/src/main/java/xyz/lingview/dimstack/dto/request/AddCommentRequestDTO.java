package xyz.lingview.dimstack.dto.request;

import lombok.Data;

@Data
public class AddCommentRequestDTO {
    private String article_alias;
    private String content;
    private String to_comment_id;
}
