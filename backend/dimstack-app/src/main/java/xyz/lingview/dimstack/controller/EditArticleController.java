package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RateLimit;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.dto.request.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.request.UpdateArticleDTO;
import xyz.lingview.dimstack.dto.response.ArticleOperationResult;
import xyz.lingview.dimstack.service.CurrentUserService;
import xyz.lingview.dimstack.service.EditArticleService;

import java.util.Map;

@RestController
@Slf4j
@RequestMapping("/api")
public class EditArticleController {

    @Autowired
    private EditArticleService editArticleService;

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping("/getarticlelist")
    @RequiresPermission({"post:view", "post:edit"})
    public ApiResponse<Map<String, Object>> getArticleList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        try {
            String username = currentUserService.getCurrentUsername();

            if (username == null) {
                return ApiResponse.error(401, "用户未登录");
            }

            Map<String, Object> result;
            if (keyword != null && !keyword.trim().isEmpty()) {
                result = editArticleService.searchArticlesByUsername(username, keyword.trim(), page, size);
            } else {
                result = editArticleService.getArticleListByUsername(username, page, size);
            }

            return ApiResponse.success("获取文章列表成功", result);

        } catch (Exception e) {
            return ApiResponse.error(500, "获取文章列表失败: " + e.getMessage());
        }
    }

    @PostMapping("/updatearticle")
    @RequiresPermission({"post:update", "post:edit"})
    public ApiResponse<Void> updateArticle(
            @RequestBody UpdateArticleDTO updateArticleDTO) {
        try {
            String username = currentUserService.getCurrentUsername();

            if (username == null) {
                return ApiResponse.error(401, "用户未登录");
            }

            ArticleOperationResult result = editArticleService.updateArticleWithNotification(updateArticleDTO, username);

            return result.isSuccess()
                    ? ApiResponse.success(result.getMessage())
                    : ApiResponse.error(500, result.getMessage());

        } catch (Exception e) {
            log.error("文章更新失败", e);
            return ApiResponse.error(500, "文章更新失败: " + e.getMessage());
        }
    }

    @GetMapping("/getarticle/{articleId}")
    @RequiresPermission({"post:details", "post:edit"})
    public ApiResponse<ArticleDetailDTO> getArticleDetail(
            @PathVariable String articleId) {
        try {
            String username = currentUserService.getCurrentUsername();

            if (username == null) {
                return ApiResponse.error(401, "用户未登录");
            }

            ArticleDetailDTO article = editArticleService.getArticleDetailById(articleId, username);

//            System.out.println("article: " + article);
            if (article != null) {
                return ApiResponse.success("获取文章详情成功", article);
            } else {
                return ApiResponse.error(404, "获取文章详情失败：权限不足或文章不存在");
            }

        } catch (Exception e) {
            return ApiResponse.error(500, "获取文章详情失败: " + e.getMessage());
        }
    }

    @PostMapping("/deletearticle")
    @RequiresPermission({"post:delete", "post:edit"})
    public ApiResponse<Void> deleteArticle(
            @RequestBody Map<String, String> payload) {
        try {
            String username = currentUserService.getCurrentUsername();

            if (username == null) {
                return ApiResponse.error(401, "用户未登录");
            }

            String articleId = payload.get("article_id");
            if (articleId == null || articleId.isEmpty()) {
                return ApiResponse.error(400, "文章ID不能为空");
            }

            ArticleOperationResult result = editArticleService.deleteArticleWithNotification(articleId, username);

            return result.isSuccess()
                    ? ApiResponse.success(result.getMessage())
                    : ApiResponse.error(500, result.getMessage());

        } catch (Exception e) {
            log.error("文章删除失败", e);
            return ApiResponse.error(500, "文章删除失败: " + e.getMessage());
        }
    }

    @PostMapping("/unpublisharticle")
    @RequiresPermission({"post:unpublish", "post:edit"})
    public ApiResponse<Void> unpublishArticle(
            @RequestBody Map<String, String> payload) {
        try {
            String username = currentUserService.getCurrentUsername();

            if (username == null) {
                return ApiResponse.error(401, "用户未登录");
            }

            String articleId = payload.get("article_id");

            if (articleId == null || articleId.isEmpty()) {
                return ApiResponse.error(400, "文章ID不能为空");
            }

            ArticleOperationResult result = editArticleService.unpublishArticleWithValidation(articleId, username);

            return result.isSuccess()
                    ? ApiResponse.success(result.getMessage())
                    : ApiResponse.error(500, result.getMessage());

        } catch (Exception e) {
            log.error("取消发布失败", e);
            return ApiResponse.error(500, "取消发布失败: " + e.getMessage());
        }
    }


    @PostMapping("/publisharticle")
    @RateLimit(window = 60, maxRequests = 2)
    @RequiresPermission({"post:publish", "post:edit"})
    public ApiResponse<Void> publishArticle(
            @RequestBody Map<String, String> payload) {
        try {
            String username = currentUserService.getCurrentUsername();

            if (username == null) {
                return ApiResponse.error(401, "用户未登录");
            }

            String articleId = payload.get("article_id");

            if (articleId == null || articleId.isEmpty()) {
                return ApiResponse.error(400, "文章ID不能为空");
            }

            ArticleOperationResult result = editArticleService.publishArticleWithReview(articleId, username);

            return result.isSuccess()
                    ? ApiResponse.success(result.getMessage())
                    : ApiResponse.error(500, result.getMessage());

        } catch (Exception e) {
            log.error("发布失败", e);
            return ApiResponse.error(500, "发布失败: " + e.getMessage());
        }
    }

    @PostMapping("/removearticlepassword")
    @RequiresPermission({"post:removepassword", "post:edit"})
    public ApiResponse<Void> removeArticlePassword(
            @RequestBody Map<String, String> payload) {
        try {
            String username = currentUserService.getCurrentUsername();

            if (username == null) {
                return ApiResponse.error(401, "用户未登录");
            }

            String articleId = payload.get("article_id");
            if (articleId == null || articleId.isEmpty()) {
                return ApiResponse.error(400, "文章ID不能为空");
            }

            ArticleOperationResult result = editArticleService.removeArticlePasswordWithValidation(articleId, username);

            return result.isSuccess()
                    ? ApiResponse.success(result.getMessage())
                    : ApiResponse.error(500, result.getMessage());

        } catch (Exception e) {
            log.error("移除文章密码失败", e);
            return ApiResponse.error(500, "移除文章密码失败: " + e.getMessage());
        }
    }
}
