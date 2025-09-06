package xyz.lingview.dimstack.mapper;

import xyz.lingview.dimstack.domain.ArticleCategory;
import xyz.lingview.dimstack.domain.ArticleCategoryAndCount;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface ArticleCategoryMapper {

    List<ArticleCategory> findAllEnabledCategories();

    List<ArticleCategoryAndCount> findAllEnabledCategoriesAndCount();
}
