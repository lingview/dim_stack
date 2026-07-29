package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import xyz.lingview.dimstack.domain.ArticleTag;
import xyz.lingview.dimstack.dto.request.ArticleDTO;

import java.util.List;

@Mapper
public interface ArticleTagMapper {
    List<ArticleTag> findAllEnabledTags();

    List<ArticleTag> findAll();
    List<ArticleTag> findByStatus(@Param("status") Integer status);
    ArticleTag findById(@Param("id") Integer id);
    ArticleTag findByName(@Param("tagName") String tagName);
    int insert(ArticleTag tag);
    int update(ArticleTag tag);
    int updateStatus(@Param("id") Integer id, @Param("status") Integer status);

    // 根据标签名称查询文章数量
    int countArticlesByTag(@Param("tagName") String tagName);
    List<ArticleDTO> findArticlesByTag(@Param("tagName") String tagName,
                                       @Param("offset") int offset,
                                       @Param("size") int size);
}
