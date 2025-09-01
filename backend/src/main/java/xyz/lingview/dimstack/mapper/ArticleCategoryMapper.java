package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import xyz.lingview.dimstack.domain.ArticleCategory;

import java.util.List;

@Mapper
public interface ArticleCategoryMapper {
    List<ArticleCategory> findAllEnabledCategories();
}
