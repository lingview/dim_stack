package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.UploadArticle;
import xyz.lingview.dimstack.domain.UploadAttachment;

@Mapper
@Repository
public interface UploadMapper {
    int insertUploadAttachment(UploadAttachment UploadAttachment);
    int insertUploadArticle(UploadArticle UploadArticle);
    int selectArticleCountByAliasAndUuid(String alias, String uuid);
    int insertArticleTagRelation(@Param("articleId") String articleId, @Param("tagName") String tagName);
    int deleteArticleTagRelations(@Param("articleId") String articleId);

    UploadAttachment selectByAccessKey(@Param("accessKey") String accessKey);
}
