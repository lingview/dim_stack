package xyz.lingview.dimstack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleOperationResult {
    private boolean success;
    private String message;
    private Object data;
}
