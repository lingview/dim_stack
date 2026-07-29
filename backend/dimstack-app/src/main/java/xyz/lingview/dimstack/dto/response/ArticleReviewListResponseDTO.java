package xyz.lingview.dimstack.dto.response;

import lombok.Data;
import xyz.lingview.dimstack.dto.request.ArticleReviewDTO;

import java.util.List;

@Data
public class ArticleReviewListResponseDTO {
    private List<ArticleReviewDTO> articles;
    private int total;
    private int page;
    private int size;
    private int totalPages;
}
