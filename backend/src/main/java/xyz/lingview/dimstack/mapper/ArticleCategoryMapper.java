package xyz.lingview.dimstack.mapper;

import xyz.lingview.dimstack.dto.request.ArticleDTO;
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
    
    // 多级分类相关方法
    List<ArticleCategory> findTopLevelCategories();
    List<ArticleCategory> findChildrenByParentId(@Param("parentId") Integer parentId);
    List<ArticleCategory> findTreeStructure();
    ArticleCategory findByParentAndName(@Param("parentId") Integer parentId, @Param("categoryName") String categoryName);
    int updateParentId(@Param("id") Integer id, @Param("parentId") Integer parentId);
    int deleteCategoryAndChildren(@Param("id") Integer id);

    // 通过文章id查询文章所属分类
    String getCategoryByArticleId(@Param("article_id") String article_id);
    // 增加分类文章数量
    void incrementCount(@Param("category") String category);
    // 分类文章数量-1
    void decrementCount(@Param("category") String category);
}
