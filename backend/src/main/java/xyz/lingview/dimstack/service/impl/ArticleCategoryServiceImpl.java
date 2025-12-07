package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.ArticleCategory;
import xyz.lingview.dimstack.dto.request.ArticleCategoryDTO;
import xyz.lingview.dimstack.mapper.ArticleCategoryMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.ArticleCategoryService;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ArticleCategoryServiceImpl implements ArticleCategoryService {

    @Autowired
    private ArticleCategoryMapper articleCategoryMapper;

    @Autowired
    private UserInformationMapper userInformationMapper;

    @Override
    public List<ArticleCategoryDTO> getAllCategories() {
        List<ArticleCategory> categories = articleCategoryMapper.findAll();
        return convertToDTOList(categories);
    }

    @Override
    public List<ArticleCategoryDTO> getActiveCategories() {
        List<ArticleCategory> categories = articleCategoryMapper.findByStatus(1);
        return convertToDTOList(categories);
    }

    @Override
    public ArticleCategoryDTO getCategoryById(Integer id) {
        ArticleCategory category = articleCategoryMapper.findById(id);
        return category != null ? convertToDTO(category) : null;
    }

    @Override
    public boolean createCategory(ArticleCategoryDTO categoryDTO, String founderUsername) {
        try {
            // 过滤分类名称首尾空格
            String categoryName = categoryDTO.getCategory_name().trim();

            // 检查分类名称是否已存在
            ArticleCategory existingCategory = articleCategoryMapper.findByName(categoryName);
            if (existingCategory != null) {
                throw new RuntimeException("分类名称已存在");
            }

            String founderUUID = userInformationMapper.selectUserUUID(founderUsername);
            if (founderUUID == null) {
                throw new RuntimeException("未找到用户信息");
            }

            ArticleCategory category = new ArticleCategory();
            category.setArticle_categories(categoryName);
            category.setCategories_explain(categoryDTO.getCategory_explain());
            category.setFounder(founderUUID);
            category.setStatus(1);

            int result = articleCategoryMapper.insert(category);
            return result > 0;
        } catch (Exception e) {
            log.error("创建分类失败", e);
            return false;
        }
    }
    @Override
    public boolean updateCategory(ArticleCategoryDTO categoryDTO) {
        try {
            ArticleCategory category = articleCategoryMapper.findById(categoryDTO.getId());
            if (category == null) {
                throw new RuntimeException("分类不存在");
            }

            String categoryName = categoryDTO.getCategory_name().trim();

            ArticleCategory existingCategory = articleCategoryMapper.findByName(categoryName);
            if (existingCategory != null && !existingCategory.getId().equals(categoryDTO.getId())) {
                throw new RuntimeException("分类名称已存在");
            }

            category.setArticle_categories(categoryName);
            category.setCategories_explain(categoryDTO.getCategory_explain());

            int result = articleCategoryMapper.update(category);
            return result > 0;
        } catch (Exception e) {
            log.error("更新分类失败", e);
            return false;
        }
    }

    @Override
    public boolean deleteCategory(Integer id) {
        try {
            int result = articleCategoryMapper.updateStatus(id, 0);
            return result > 0;
        } catch (Exception e) {
            log.error("删除分类失败", e);
            return false;
        }
    }

    @Override
    public boolean activateCategory(Integer id) {
        try {
            int result = articleCategoryMapper.updateStatus(id, 1);
            return result > 0;
        } catch (Exception e) {
            log.error("激活分类失败", e);
            return false;
        }
    }

    private List<ArticleCategoryDTO> convertToDTOList(List<ArticleCategory> categories) {
        return categories.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private ArticleCategoryDTO convertToDTO(ArticleCategory category) {
        ArticleCategoryDTO dto = new ArticleCategoryDTO();
        dto.setId(category.getId());
        dto.setCategory_name(category.getArticle_categories());
        dto.setCategory_explain(category.getCategories_explain());

        if (category.getFounder() != null) {
            String founderName = userInformationMapper.getUsernameByUuid(category.getFounder());
            dto.setFounder(founderName != null ? founderName : category.getFounder());
        } else {
            dto.setFounder(null);
        }

        dto.setStatus(category.getStatus());
        if (category.getCreate_time() != null) {
            dto.setCreate_time(category.getCreate_time().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        return dto;
    }
}
