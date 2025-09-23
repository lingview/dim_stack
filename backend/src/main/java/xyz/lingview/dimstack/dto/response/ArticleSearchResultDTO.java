package xyz.lingview.dimstack.dto.response;

import lombok.Data;

@Data
public class ArticleSearchResultDTO {
    private String title;
    private String alias;
    private Integer id;
    private String excerpt;
}
