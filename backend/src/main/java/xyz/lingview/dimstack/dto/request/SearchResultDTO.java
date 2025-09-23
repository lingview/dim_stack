package xyz.lingview.dimstack.dto.request;

import lombok.Data;

@Data
public class SearchResultDTO {
    private String title;
    private String alias;
    private Integer id;
    private String excerpt;

    public SearchResultDTO(String title, String alias, Integer id, String excerpt) {
        this.title = title;
        this.alias = alias;
        this.id = id;
        this.excerpt = excerpt;
    }
}
