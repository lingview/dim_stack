package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.dto.ArticleCategoryDTO;
import xyz.lingview.dimstack.dto.ArticleTagDTO;
import xyz.lingview.dimstack.service.ArticleCategoryService;
import xyz.lingview.dimstack.service.ArticleTagService;

import java.util.Map;

@RestController
@RequestMapping("/api/tags-categories")
@Slf4j
public class TagCategoryController {

    @Autowired
    private ArticleTagService articleTagService;

    @Autowired
    private ArticleCategoryService articleCategoryService;

    @GetMapping("/tags")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> getAllTags() {
        try {
            var tags = articleTagService.getAllTags();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", tags
            ));
        } catch (Exception e) {
            log.error("获取标签列表失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取标签列表失败: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/tags/active")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> getActiveTags() {
        try {
            var tags = articleTagService.getActiveTags();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", tags
            ));
        } catch (Exception e) {
            log.error("获取启用标签列表失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取启用标签列表失败: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/tags")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> createTag(@RequestBody ArticleTagDTO tagDTO, HttpSession session) {
        try {
            String username = (String) session.getAttribute("username");

            boolean result = articleTagService.createTag(tagDTO, username);
            if (result) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "标签创建成功"
                ));
            } else {
                return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "标签创建失败"
                ));
            }
        } catch (Exception e) {
            log.error("创建标签失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "创建标签失败: " + e.getMessage()
            ));
        }
    }

    @PutMapping("/tags/{id}")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> updateTag(@PathVariable Integer id, @RequestBody ArticleTagDTO tagDTO) {
        try {
            tagDTO.setId(id);
            boolean result = articleTagService.updateTag(tagDTO);
            if (result) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "标签更新成功"
                ));
            } else {
                return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "标签更新失败"
                ));
            }
        } catch (Exception e) {
            log.error("更新标签失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "更新标签失败: " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/tags/{id}")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> deleteTag(@PathVariable Integer id) {
        try {
            boolean result = articleTagService.deleteTag(id);
            if (result) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "标签删除成功"
                ));
            } else {
                return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "标签删除失败"
                ));
            }
        } catch (Exception e) {
            log.error("删除标签失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "删除标签失败: " + e.getMessage()
            ));
        }
    }

    @PutMapping("/tags/{id}/activate")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> activateTag(@PathVariable Integer id) {
        try {
            boolean result = articleTagService.activateTag(id);
            if (result) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "标签激活成功"
                ));
            } else {
                return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "标签激活失败"
                ));
            }
        } catch (Exception e) {
            log.error("激活标签失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "激活标签失败: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/categories")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> getAllCategories() {
        try {
            var categories = articleCategoryService.getAllCategories();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", categories
            ));
        } catch (Exception e) {
            log.error("获取分类列表失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取分类列表失败: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/categories/active")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> getActiveCategories() {
        try {
            var categories = articleCategoryService.getActiveCategories();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", categories
            ));
        } catch (Exception e) {
            log.error("获取启用分类列表失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取启用分类列表失败: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/categories")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> createCategory(@RequestBody ArticleCategoryDTO categoryDTO, HttpSession session) {
        try {
            String username = (String) session.getAttribute("username");

            boolean result = articleCategoryService.createCategory(categoryDTO, username);
            if (result) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "分类创建成功"
                ));
            } else {
                return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "分类创建失败"
                ));
            }
        } catch (Exception e) {
            log.error("创建分类失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "创建分类失败: " + e.getMessage()
            ));
        }
    }

    @PutMapping("/categories/{id}")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> updateCategory(@PathVariable Integer id, @RequestBody ArticleCategoryDTO categoryDTO) {
        try {
            categoryDTO.setId(id);
            boolean result = articleCategoryService.updateCategory(categoryDTO);
            if (result) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "分类更新成功"
                ));
            } else {
                return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "分类更新失败"
                ));
            }
        } catch (Exception e) {
            log.error("更新分类失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "更新分类失败: " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/categories/{id}")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> deleteCategory(@PathVariable Integer id) {
        try {
            boolean result = articleCategoryService.deleteCategory(id);
            if (result) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "分类删除成功"
                ));
            } else {
                return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "分类删除失败"
                ));
            }
        } catch (Exception e) {
            log.error("删除分类失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "删除分类失败: " + e.getMessage()
            ));
        }
    }

    @PutMapping("/categories/{id}/activate")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> activateCategory(@PathVariable Integer id) {
        try {
            boolean result = articleCategoryService.activateCategory(id);
            if (result) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "分类激活成功"
                ));
            } else {
                return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "分类激活失败"
                ));
            }
        } catch (Exception e) {
            log.error("激活分类失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "激活分类失败: " + e.getMessage()
            ));
        }
    }
}
