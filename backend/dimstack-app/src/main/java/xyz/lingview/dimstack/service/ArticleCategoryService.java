package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.ArticleCategory;
import xyz.lingview.dimstack.domain.ArticleCategoryAndCount;
import xyz.lingview.dimstack.dto.request.ArticleCategoryDTO;
import xyz.lingview.dimstack.dto.request.ArticleDTO;

import java.util.List;

public interface ArticleCategoryService {
    List<ArticleCategoryDTO> getAllCategories();
    List<ArticleCategoryDTO> getActiveCategories();
    List<ArticleCategoryDTO> getCategoryTree();
    List<ArticleCategoryDTO> getTopLevelCategories();
    List<ArticleCategoryDTO> getChildrenByParentId(Integer parentId);
    ArticleCategoryDTO getCategoryById(Integer id);
    boolean createCategory(ArticleCategoryDTO categoryDTO, String founder);
    boolean updateCategory(ArticleCategoryDTO categoryDTO);
    boolean deleteCategory(Integer id);
    boolean activateCategory(Integer id);

    // 公开前端接口方法
    List<ArticleCategory> findAllEnabledCategories();
    List<ArticleCategoryAndCount> findAllEnabledCategoriesAndCount();
    List<ArticleDTO> findArticlesByCategory(String category, int offset, int size);
    int countArticlesByCategory(String category);
}
