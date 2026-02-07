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
import java.util.*;
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
    public List<ArticleCategoryDTO> getCategoryTree() {
        List<ArticleCategory> categories = articleCategoryMapper.findTreeStructure();
        return buildTreeStructure(convertToDTOList(categories));
    }

    @Override
    public List<ArticleCategoryDTO> getTopLevelCategories() {
        List<ArticleCategory> categories = articleCategoryMapper.findTopLevelCategories();
        return convertToDTOList(categories);
    }

    @Override
    public List<ArticleCategoryDTO> getChildrenByParentId(Integer parentId) {
        List<ArticleCategory> categories = articleCategoryMapper.findChildrenByParentId(parentId);
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

            // 验证分类名称不能包含路径分隔符
            if (categoryName.contains("/")) {
                throw new RuntimeException("分类名称中不能包含 '/' 字符");
            }

            // 检查在同一父分类下分类名称是否已存在
            ArticleCategory existingCategory = articleCategoryMapper.findByParentAndName(
                categoryDTO.getParent_id(), categoryName);
            if (existingCategory != null) {
                throw new RuntimeException("在同一层级下分类名称已存在");
            }

            // 限制分类层级：最多只能有一层子分类
            if (categoryDTO.getParent_id() != null) {
                // 检查父分类是否已经是子分类
                ArticleCategory parentCategory = articleCategoryMapper.findById(categoryDTO.getParent_id());
                if (parentCategory != null && parentCategory.getParent_id() != null) {
                    throw new RuntimeException("只能创建一级子分类，不能创建三级分类");
                }
            }

            String founderUUID = userInformationMapper.selectUserUUID(founderUsername);
            if (founderUUID == null) {
                throw new RuntimeException("未找到用户信息");
            }

            ArticleCategory category = new ArticleCategory();
            category.setParent_id(categoryDTO.getParent_id());
            category.setArticle_categories(categoryName);
            category.setCategories_explain(categoryDTO.getCategory_explain());
            category.setFounder(founderUUID);
            category.setStatus(1);
            category.setArticle_count(0);

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

            // 验证分类名称不能包含路径分隔符
            if (categoryName.contains("/")) {
                throw new RuntimeException("分类名称中不能包含 '/' 字符");
            }

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
            // 级联禁用
            disableCategoryAndChildren(id);
            return true;
        } catch (Exception e) {
            log.error("禁用分类失败", e);
            return false;
        }
    }


    private void disableCategoryAndChildren(Integer categoryId) {

        articleCategoryMapper.updateStatus(categoryId, 0);

        List<ArticleCategory> children = articleCategoryMapper.findChildrenByParentId(categoryId);

        for (ArticleCategory child : children) {
            disableCategoryAndChildren(child.getId());
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
        dto.setParent_id(category.getParent_id());
        dto.setCategory_name(category.getArticle_categories());
        dto.setCategory_explain(category.getCategories_explain());
        dto.setArticle_count(category.getArticle_count());
        dto.setFull_path(category.getFull_path());
        dto.setLevel(category.getLevel());

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

        if (category.getId() != null) {
            List<ArticleCategory> children = articleCategoryMapper.findChildrenByParentId(category.getId());
            dto.setHas_children(children != null && !children.isEmpty());
            dto.setChild_count(children != null ? children.size() : 0);
        }

        if (category.getParent_id() != null) {
            ArticleCategory parent = articleCategoryMapper.findById(category.getParent_id());
            if (parent != null) {
                dto.setParent_name(parent.getArticle_categories());
            }
        }
        
        return dto;
    }


    private List<ArticleCategoryDTO> buildTreeStructure(List<ArticleCategoryDTO> flatList) {
        Map<Integer, ArticleCategoryDTO> nodeMap = new HashMap<>();
        List<ArticleCategoryDTO> roots = new ArrayList<>();

        for (ArticleCategoryDTO node : flatList) {
            nodeMap.put(node.getId(), node);
            node.setChildren(new ArrayList<ArticleCategoryDTO>());
        }

        for (ArticleCategoryDTO node : flatList) {
            if (node.getParent_id() == null) {
                roots.add(node);
            } else {
                ArticleCategoryDTO parent = nodeMap.get(node.getParent_id());
                if (parent != null) {
                    parent.getChildren().add(node);
                }
            }
        }
        
        return roots;
    }
}
