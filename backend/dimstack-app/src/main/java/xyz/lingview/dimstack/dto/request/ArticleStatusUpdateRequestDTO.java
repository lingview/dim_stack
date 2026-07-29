package xyz.lingview.dimstack.dto.request;

import lombok.Data;

@Data
public class ArticleStatusUpdateRequestDTO {
    private String articleId;
    private Byte status;
}
