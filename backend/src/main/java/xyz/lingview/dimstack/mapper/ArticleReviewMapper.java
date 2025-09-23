package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.dto.request.ArticleReviewDTO;
import java.util.List;

@Mapper
public interface ArticleReviewMapper {

    List<ArticleReviewDTO> selectUnreviewedArticles(@Param("offset") int offset, @Param("size") int size);

    int countUnreviewedArticles();

    Article selectArticleById(@Param("article_id") String articleId);

    void updateArticleStatus(@Param("article_id") String articleId, @Param("status") Byte status);

    // 审核已发布的文章
    List<ArticleReviewDTO> selectAllArticles(@Param("offset") int offset, @Param("size") int size);

    int countAllArticles();


}
