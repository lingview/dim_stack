package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import xyz.lingview.dimstack.dto.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.EditArticleDTO;
import xyz.lingview.dimstack.dto.UpdateArticleDTO;

import java.util.List;
import java.util.Map;

@Mapper
public interface EditArticleMapper {
    List<EditArticleDTO> getArticleListByUuid(String uuid);
    String getUuidByUsername(String username);

    ArticleDetailDTO getArticleDetailById(String articleId);

    String getUuidByArticleId(String articleId);
    String getUsernameByUuid(String uuid);
    int updateArticle(UpdateArticleDTO updateArticleDTO);

    int deleteArticle(Map<String, Object> params);
    int unpublishArticle(Map<String, Object> params);
    int publishArticle(Map<String, Object> params);


}
