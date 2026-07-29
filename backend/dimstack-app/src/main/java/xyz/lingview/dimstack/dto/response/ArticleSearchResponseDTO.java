package xyz.lingview.dimstack.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class ArticleSearchResponseDTO {
    private List<ArticleSearchResultDTO> data;
    private int count;
}
