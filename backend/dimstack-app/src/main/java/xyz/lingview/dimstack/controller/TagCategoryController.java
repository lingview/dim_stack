package xyz.lingview.dimstack.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.dto.request.ArticleCategoryDTO;
import xyz.lingview.dimstack.dto.request.ArticleTagDTO;
import xyz.lingview.dimstack.service.ArticleCategoryService;
import xyz.lingview.dimstack.service.ArticleTagService;
import xyz.lingview.dimstack.service.CurrentUserService;

@RestController
@RequestMapping("/api/tags-categories")
@Slf4j
public class TagCategoryController {

    @Autowired
    private ArticleTagService articleTagService;

    @Autowired
    private ArticleCategoryService articleCategoryService;

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping("/tags")
    @RequiresPermission("system:tags:management")
    public ApiResponse<?> getAllTags() {
        try {
            var tags = articleTagService.getAllTags();
            return ApiResponse.success(tags);
        } catch (Exception e) {
            log.error("获取标签列表失败", e);
            return ApiResponse.error(500, "获取标签列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/tags/active")
    @RequiresPermission("system:tags:management")
    public ApiResponse<?> getActiveTags() {
        try {
            var tags = articleTagService.getActiveTags();
            return ApiResponse.success(tags);
        } catch (Exception e) {
            log.error("获取启用标签列表失败", e);
            return ApiResponse.error(500, "获取启用标签列表失败: " + e.getMessage());
        }
    }

    @PostMapping("/tags")
    @RequiresPermission("system:tags:management")
    public ApiResponse<Void> createTag(@Valid @RequestBody ArticleTagDTO tagDTO) {
        try {
            String username = currentUserService.getCurrentUsername();

            boolean result = articleTagService.createTag(tagDTO, username);
            if (result) {
                return ApiResponse.success("标签创建成功");
            } else {
                return ApiResponse.error(500, "标签创建失败");
            }
        } catch (Exception e) {
            log.error("创建标签失败", e);
            return ApiResponse.error(500, "创建标签失败: " + e.getMessage());
        }
    }

    @PutMapping("/tags/{id}")
    @RequiresPermission("system:tags:management")
    public ApiResponse<Void> updateTag(@PathVariable Integer id, @Valid @RequestBody ArticleTagDTO tagDTO) {
        try {
            tagDTO.setId(id);
            boolean result = articleTagService.updateTag(tagDTO);
            if (result) {
                return ApiResponse.success("标签更新成功");
            } else {
                return ApiResponse.error(500, "标签更新失败");
            }
        } catch (Exception e) {
            log.error("更新标签失败", e);
            return ApiResponse.error(500, "更新标签失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/tags/{id}")
    @RequiresPermission("system:tags:management")
    public ApiResponse<Void> deleteTag(@PathVariable Integer id) {
        try {
            boolean result = articleTagService.deleteTag(id);
            if (result) {
                return ApiResponse.success("标签删除成功");
            } else {
                return ApiResponse.error(500, "标签删除失败");
            }
        } catch (Exception e) {
            log.error("删除标签失败", e);
            return ApiResponse.error(500, "删除标签失败: " + e.getMessage());
        }
    }

    @PutMapping("/tags/{id}/activate")
    @RequiresPermission("system:tags:management")
    public ApiResponse<Void> activateTag(@PathVariable Integer id) {
        try {
            boolean result = articleTagService.activateTag(id);
            if (result) {
                return ApiResponse.success("标签激活成功");
            } else {
                return ApiResponse.error(500, "标签激活失败");
            }
        } catch (Exception e) {
            log.error("激活标签失败", e);
            return ApiResponse.error(500, "激活标签失败: " + e.getMessage());
        }
    }

    @GetMapping("/categories")
    @RequiresPermission("system:categories:management")
    public ApiResponse<?> getAllCategories() {
        try {
            var categories = articleCategoryService.getAllCategories();
            return ApiResponse.success(categories);
        } catch (Exception e) {
            log.error("获取分类列表失败", e);
            return ApiResponse.error(500, "获取分类列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/categories/active")
    @RequiresPermission("system:categories:management")
    public ApiResponse<?> getActiveCategories() {
        try {
            var categories = articleCategoryService.getActiveCategories();
            return ApiResponse.success(categories);
        } catch (Exception e) {
            log.error("获取启用分类列表失败", e);
            return ApiResponse.error(500, "获取启用分类列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/categories/tree")
    @RequiresPermission("system:categories:management")
    public ApiResponse<?> getCategoryTree() {
        try {
            var categories = articleCategoryService.getCategoryTree();
            return ApiResponse.success(categories);
        } catch (Exception e) {
            log.error("获取分类树形结构失败", e);
            return ApiResponse.error(500, "获取分类树形结构失败: " + e.getMessage());
        }
    }

    @GetMapping("/categories/top-level")
    @RequiresPermission("system:categories:management")
    public ApiResponse<?> getTopLevelCategories() {
        try {
            var categories = articleCategoryService.getTopLevelCategories();
            return ApiResponse.success(categories);
        } catch (Exception e) {
            log.error("获取顶级分类列表失败", e);
            return ApiResponse.error(500, "获取顶级分类列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/categories/children/{parentId}")
    @RequiresPermission("system:categories:management")
    public ApiResponse<?> getChildrenByParentId(@PathVariable Integer parentId) {
        try {
            var categories = articleCategoryService.getChildrenByParentId(parentId);
            return ApiResponse.success(categories);
        } catch (Exception e) {
            log.error("获取子分类列表失败", e);
            return ApiResponse.error(500, "获取子分类列表失败: " + e.getMessage());
        }
    }

    @PostMapping("/categories")
    @RequiresPermission("system:categories:management")
    public ApiResponse<Void> createCategory(@RequestBody ArticleCategoryDTO categoryDTO) {
        try {
            String username = currentUserService.getCurrentUsername();

            boolean result = articleCategoryService.createCategory(categoryDTO, username);
            if (result) {
                return ApiResponse.success("分类创建成功");
            } else {
                return ApiResponse.error(500, "分类创建失败");
            }
        } catch (Exception e) {
            log.error("创建分类失败", e);
            return ApiResponse.error(500, "创建分类失败: " + e.getMessage());
        }
    }

    @PutMapping("/categories/{id}")
    @RequiresPermission("system:categories:management")
    public ApiResponse<Void> updateCategory(@PathVariable Integer id, @RequestBody ArticleCategoryDTO categoryDTO) {
        try {
            categoryDTO.setId(id);
            boolean result = articleCategoryService.updateCategory(categoryDTO);
            if (result) {
                return ApiResponse.success("分类更新成功");
            } else {
                return ApiResponse.error(500, "分类更新失败");
            }
        } catch (Exception e) {
            log.error("更新分类失败", e);
            return ApiResponse.error(500, "更新分类失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/categories/{id}")
    @RequiresPermission("system:categories:management")
    public ApiResponse<Void> deleteCategory(@PathVariable Integer id) {
        try {
            boolean result = articleCategoryService.deleteCategory(id);
            if (result) {
                return ApiResponse.success("分类删除成功");
            } else {
                return ApiResponse.error(500, "分类删除失败");
            }
        } catch (Exception e) {
            log.error("删除分类失败", e);
            return ApiResponse.error(500, "删除分类失败: " + e.getMessage());
        }
    }

    @PutMapping("/categories/{id}/activate")
    @RequiresPermission("system:categories:management")
    public ApiResponse<Void> activateCategory(@PathVariable Integer id) {
        try {
            boolean result = articleCategoryService.activateCategory(id);
            if (result) {
                return ApiResponse.success("分类激活成功");
            } else {
                return ApiResponse.error(500, "分类激活失败");
            }
        } catch (Exception e) {
            log.error("激活分类失败", e);
            return ApiResponse.error(500, "激活分类失败: " + e.getMessage());
        }
    }
}
