package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import xyz.lingview.dimstack.domain.ArticleTag;

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
}
