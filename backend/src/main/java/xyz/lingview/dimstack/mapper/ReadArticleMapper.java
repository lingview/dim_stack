package xyz.lingview.dimstack.mapper;

import xyz.lingview.dimstack.domain.ReadArticle;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface ReadArticleMapper {
    ReadArticle selectByArticleId(@Param("article_id") String articleId);

    ReadArticle selectByAlias(@Param("alias") String alias);

    boolean isArticleNeedPassword(@Param("alias") String alias);

    void updatePageViews(@Param("alias") String alias);

    // seo优化用
    List<ReadArticle> listAllArticles();
    List<String> listAllCategories();
    List<String> listAllTags();
}
