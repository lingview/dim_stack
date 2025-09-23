package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.dto.request.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.request.UpdateArticleDTO;

import java.util.Map;

public interface EditArticleService {

    Map<String, Object> getArticleListByUsername(String username, Integer page, Integer size);

    ArticleDetailDTO getArticleDetailById(String articleId, String username);

    boolean updateArticle(UpdateArticleDTO updateArticleDTO, String sessionUsername);

    boolean deleteArticle(String articleId, String sessionUsername);
    boolean unpublishArticle(String articleId, String sessionUsername);
    boolean publishArticle(String articleId, String sessionUsername);
    String getArticleUuid(String articleId);
}
