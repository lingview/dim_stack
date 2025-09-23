package xyz.lingview.dimstack.dto.request;

import lombok.Data;
import java.util.Date;

@Data
public class ArticleDTO {
    private Integer id;
    private String article_id;
    private String title;
    private String excerpt;
    private String image;
    private Date date;
    private String author;
    private String category;
    private String alias;
}
