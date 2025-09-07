package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import xyz.lingview.dimstack.dto.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.EditArticleDTO;
import xyz.lingview.dimstack.dto.UpdateArticleDTO;

import java.util.List;

@Mapper
public interface EditArticleMapper {
    List<EditArticleDTO> getArticleListByUuid(String uuid);
    String getUuidByUsername(String username);

    ArticleDetailDTO getArticleDetailById(String articleId);

    String getUuidByArticleId(String articleId);
    String getUsernameByUuid(String uuid);
    int updateArticle(UpdateArticleDTO updateArticleDTO);

}
