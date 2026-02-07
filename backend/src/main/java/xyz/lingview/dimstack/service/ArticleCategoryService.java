package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.dto.request.ArticleCategoryDTO;

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
}
