package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.dto.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.EditArticleDTO;
import xyz.lingview.dimstack.dto.UpdateArticleDTO;

import java.util.List;

public interface EditArticleService {

    List<EditArticleDTO> getArticleListByUsername(String username);

    ArticleDetailDTO getArticleDetailById(String articleId, String username);

    boolean updateArticle(UpdateArticleDTO updateArticleDTO, String sessionUsername);

    boolean deleteArticle(String articleId, String sessionUsername);
    boolean unpublishArticle(String articleId, String sessionUsername);
    boolean publishArticle(String articleId, String sessionUsername);
    String getArticleUuid(String articleId);

}