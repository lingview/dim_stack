package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RateLimit;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.dto.request.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.request.UpdateArticleDTO;
import xyz.lingview.dimstack.dto.response.ArticleOperationResult;
import xyz.lingview.dimstack.service.EditArticleService;

import java.util.HashMap;
import java.util.Map;

@RestController
@Slf4j
@RequestMapping("/api")
public class EditArticleController {

    @Autowired
    private EditArticleService editArticleService;

    @GetMapping("/getarticlelist")
    @RequiresPermission({"post:view", "post:edit"})
    public ResponseEntity<Map<String, Object>> getArticleList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");

            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            Map<String, Object> result = editArticleService.getArticleListByUsername(username, page, size);

            response.put("success", true);
            response.put("message", "获取文章列表成功");
            response.put("data", result);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取文章列表失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/updatearticle")
    @RequiresPermission({"post:update", "post:edit"})
    public ResponseEntity<Map<String, Object>> updateArticle(
            @RequestBody UpdateArticleDTO updateArticleDTO,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");

            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            ArticleOperationResult result = editArticleService.updateArticleWithNotification(updateArticleDTO, username);
            
            response.put("success", result.isSuccess());
            response.put("message", result.getMessage());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("文章更新失败", e);
            response.put("success", false);
            response.put("message", "文章更新失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/getarticle/{articleId}")
    @RequiresPermission({"post:details", "post:edit"})
    public ResponseEntity<Map<String, Object>> getArticleDetail(
            @PathVariable String articleId,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");

            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            ArticleDetailDTO article = editArticleService.getArticleDetailById(articleId, username);

//            System.out.println("article: " + article);
            if (article != null) {
                response.put("success", true);
                response.put("message", "获取文章详情成功");
                response.put("data", article);
            } else {
                response.put("success", false);
                response.put("message", "获取文章详情失败：权限不足或文章不存在");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取文章详情失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/deletearticle")
    @RequiresPermission({"post:delete", "post:edit"})
    public ResponseEntity<Map<String, Object>> deleteArticle(
            @RequestBody Map<String, String> payload,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");

            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            String articleId = payload.get("article_id");
            if (articleId == null || articleId.isEmpty()) {
                response.put("success", false);
                response.put("message", "文章ID不能为空");
                return ResponseEntity.ok(response);
            }

            ArticleOperationResult result = editArticleService.deleteArticleWithNotification(articleId, username);
            
            response.put("success", result.isSuccess());
            response.put("message", result.getMessage());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("文章删除失败", e);
            response.put("success", false);
            response.put("message", "文章删除失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/unpublisharticle")
    @RequiresPermission({"post:unpublish", "post:edit"})
    public ResponseEntity<Map<String, Object>> unpublishArticle(
            @RequestBody Map<String, String> payload,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");

            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            String articleId = payload.get("article_id");

            if (articleId == null || articleId.isEmpty()) {
                response.put("success", false);
                response.put("message", "文章ID不能为空");
                return ResponseEntity.ok(response);
            }

            ArticleOperationResult result = editArticleService.unpublishArticleWithValidation(articleId, username);
            
            response.put("success", result.isSuccess());
            response.put("message", result.getMessage());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("取消发布失败", e);
            response.put("success", false);
            response.put("message", "取消发布失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }


    @PostMapping("/publisharticle")
    @RateLimit(window = 60, maxRequests = 2)
    @RequiresPermission({"post:publish", "post:edit"})
    public ResponseEntity<Map<String, Object>> publishArticle(
            @RequestBody Map<String, String> payload,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");

            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            String articleId = payload.get("article_id");

            if (articleId == null || articleId.isEmpty()) {
                response.put("success", false);
                response.put("message", "文章ID不能为空");
                return ResponseEntity.ok(response);
            }

            ArticleOperationResult result = editArticleService.publishArticleWithReview(articleId, username);
            
            response.put("success", result.isSuccess());
            response.put("message", result.getMessage());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("发布失败", e);
            response.put("success", false);
            response.put("message", "发布失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/removearticlepassword")
    @RequiresPermission({"post:removepassword", "post:edit"})
    public ResponseEntity<Map<String, Object>> removeArticlePassword(
            @RequestBody Map<String, String> payload,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");

            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            String articleId = payload.get("article_id");
            if (articleId == null || articleId.isEmpty()) {
                response.put("success", false);
                response.put("message", "文章ID不能为空");
                return ResponseEntity.ok(response);
            }

            ArticleOperationResult result = editArticleService.removeArticlePasswordWithValidation(articleId, username);
            
            response.put("success", result.isSuccess());
            response.put("message", result.getMessage());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("移除文章密码失败", e);
            response.put("success", false);
            response.put("message", "移除文章密码失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}
