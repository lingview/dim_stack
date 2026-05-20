package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import xyz.lingview.dimstack.dto.request.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.request.EditArticleDTO;
import xyz.lingview.dimstack.dto.request.UpdateArticleDTO;

import java.util.List;
import java.util.Map;

@Mapper
public interface EditArticleMapper {
    List<EditArticleDTO> getArticleListByUuid(@Param("uuid") String uuid,
                                             @Param("offset") int offset,
                                             @Param("size") int size);

    int countArticlesByUuid(@Param("uuid") String uuid);

    String getUuidByUsername(String username);

    ArticleDetailDTO getArticleDetailById(String articleId);

    String getUuidByArticleId(String articleId);
    String getUsernameByUuid(String uuid);

    // updateArticle接口已废弃（后续可能移除），请使用updateArticleWithCategory接口
    int updateArticle(UpdateArticleDTO updateArticleDTO);
    int updateArticleWithCategory(Map<String, Object> params);

    int deleteArticle(Map<String, Object> params);
    int unpublishArticle(Map<String, Object> params);
    int publishArticle(Map<String, Object> params);

    int removeArticlePassword(Map<String, Object> params);

    int deleteArticleTagRelations(@Param("articleId") String articleId);
    int insertArticleTagRelation(@Param("articleId") String articleId, @Param("tagName") String tagName);

    String getCategoryByArticleId(@Param("article_id") String article_id);
    
    String getArticleContentById(@Param("articleId") String articleId);

    int updateArticleStatus(@Param("articleId") String articleId, @Param("status") Integer status);

    List<EditArticleDTO> searchArticlesByUuid(@Param("uuid") String uuid,
                                             @Param("keyword") String keyword,
                                             @Param("offset") int offset,
                                             @Param("size") int size);

    int countSearchArticlesByUuid(@Param("uuid") String uuid, @Param("keyword") String keyword);
}
