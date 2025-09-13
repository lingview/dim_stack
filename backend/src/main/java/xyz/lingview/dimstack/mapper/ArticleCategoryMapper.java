package xyz.lingview.dimstack.mapper;

import xyz.lingview.dimstack.dto.ArticleDTO;
import xyz.lingview.dimstack.domain.ArticleCategory;
import xyz.lingview.dimstack.domain.ArticleCategoryAndCount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ArticleCategoryMapper {

    List<ArticleCategory> findAllEnabledCategories();

    List<ArticleCategoryAndCount> findAllEnabledCategoriesAndCount();

    List<ArticleDTO> findArticlesByCategory(@Param("category") String category,
                                          @Param("offset") int offset,
                                          @Param("limit") int limit);

    int countArticlesByCategory(@Param("category") String category);

    List<ArticleCategory> findAll();
    List<ArticleCategory> findByStatus(@Param("status") Integer status);
    ArticleCategory findById(@Param("id") Integer id);
    ArticleCategory findByName(@Param("categoryName") String categoryName);
    int insert(ArticleCategory category);
    int update(ArticleCategory category);
    int updateStatus(@Param("id") Integer id, @Param("status") Integer status);
}
