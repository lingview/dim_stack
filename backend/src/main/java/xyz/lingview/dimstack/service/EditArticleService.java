package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.dto.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.EditArticleDTO;
import xyz.lingview.dimstack.dto.UpdateArticleDTO;

import java.util.List;

public interface EditArticleService {

    List<EditArticleDTO> getArticleListByUsername(String username);

    ArticleDetailDTO getArticleDetailById(String articleId, String username);

    boolean updateArticle(UpdateArticleDTO updateArticleDTO, String sessionUsername);

}