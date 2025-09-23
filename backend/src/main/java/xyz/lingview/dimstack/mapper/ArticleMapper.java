package xyz.lingview.dimstack.mapper;

import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.dto.request.ArticleDTO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
@Repository
public interface ArticleMapper {

    List<ArticleDTO> selectArticlesForHomePage(int offset, int size, String category);

    int countArticles(String category);

    // 评论区
    Article selectArticleByAlias(String alias);
    Article selectArticleByArticleId(String articleId);

}
