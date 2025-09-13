package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.dto.ArticleCategoryDTO;

import java.util.List;

public interface ArticleCategoryService {
    List<ArticleCategoryDTO> getAllCategories();
    List<ArticleCategoryDTO> getActiveCategories();
    ArticleCategoryDTO getCategoryById(Integer id);
    boolean createCategory(ArticleCategoryDTO categoryDTO, String founder);
    boolean updateCategory(ArticleCategoryDTO categoryDTO);
    boolean deleteCategory(Integer id);
    boolean activateCategory(Integer id);
}
