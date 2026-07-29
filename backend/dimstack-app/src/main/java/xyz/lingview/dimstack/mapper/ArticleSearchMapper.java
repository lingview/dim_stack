package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.Article;

import java.util.List;

@Mapper
@Repository
public interface ArticleSearchMapper {

    List<Article> searchArticlesCn(String keyword);
    List<Article> searchArticlesEn(String keyword);
    List<Article> findAllArticles();

}
