package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.dto.request.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.request.UpdateArticleDTO;
import xyz.lingview.dimstack.dto.response.ArticleOperationResult;

import java.util.Map;

public interface EditArticleService {

    Map<String, Object> getArticleListByUsername(String username, Integer page, Integer size);

    ArticleDetailDTO getArticleDetailById(String articleId, String username);

    ArticleOperationResult updateArticleWithNotification(UpdateArticleDTO updateArticleDTO, String sessionUsername);

    ArticleOperationResult deleteArticleWithNotification(String articleId, String sessionUsername);
    
    ArticleOperationResult unpublishArticleWithValidation(String articleId, String sessionUsername);
    
    ArticleOperationResult publishArticleWithReview(String articleId, String sessionUsername);
    
    ArticleOperationResult removeArticlePasswordWithValidation(String articleId, String sessionUsername);

    boolean updateArticle(UpdateArticleDTO updateArticleDTO, String sessionUsername);

    boolean deleteArticle(String articleId, String sessionUsername);
    boolean unpublishArticle(String articleId, String sessionUsername);
    boolean publishArticle(String articleId, String sessionUsername);
    String getArticleUuid(String articleId);

    String getArticleContent(String articleId);
}
