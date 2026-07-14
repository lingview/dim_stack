package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.dto.response.ArticleReviewListResponseDTO;
import xyz.lingview.dimstack.dto.response.ArticleReviewStatusResponseDTO;

public interface ArticleReviewService {

    ArticleReviewListResponseDTO getUnreviewedArticles(Integer page, Integer size);

    ArticleReviewListResponseDTO getAllArticles(Integer page, Integer size);

    Article getArticleContent(String articleId);

    ArticleReviewStatusResponseDTO deleteArticle(String articleId);

    ArticleReviewStatusResponseDTO updateArticleStatus(String articleId, Byte status);
}