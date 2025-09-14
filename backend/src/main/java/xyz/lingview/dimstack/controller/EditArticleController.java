package xyz.lingview.dimstack.controller;

import cn.hutool.crypto.digest.BCrypt;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.dto.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.EditArticleDTO;
import xyz.lingview.dimstack.dto.UpdateArticleDTO;
import xyz.lingview.dimstack.mapper.EditArticleMapper;
import xyz.lingview.dimstack.mapper.SiteConfigMapper;
import xyz.lingview.dimstack.service.EditArticleService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EditArticleController {

    @Autowired
    private EditArticleService editArticleService;

    @Autowired
    private SiteConfigMapper SiteConfigMapper;

    @Autowired
    EditArticleMapper editArticleMapper;

    @GetMapping("/getarticlelist")
    @RequiresPermission("post:create")
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

    // 文章更新
    @PostMapping("/updatearticle")
    @RequiresPermission("post:create")
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

            if (updateArticleDTO.getPassword() != null && !updateArticleDTO.getPassword().isEmpty()) {
                String hashedPassword = BCrypt.hashpw(updateArticleDTO.getPassword(), BCrypt.gensalt());
                updateArticleDTO.setPassword(hashedPassword);
            }
            int articleDefault = SiteConfigMapper.getArticleStatus();

            updateArticleDTO.setStatus(articleDefault);

            boolean result = editArticleService.updateArticle(updateArticleDTO, username);

            if (result) {
                response.put("success", true);
                response.put("message", "文章更新成功");
            } else {
                response.put("success", false);
                response.put("message", "文章更新失败：权限不足或文章不存在");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "文章更新失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/getarticle/{articleId}")
    @RequiresPermission("post:create")
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

            System.out.println("article: " + article);
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
    @RequiresPermission("post:create")
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

            boolean result = editArticleService.deleteArticle(articleId, username);

            if (result) {
                response.put("success", true);
                response.put("message", "文章删除成功");
            } else {
                response.put("success", false);
                response.put("message", "文章删除失败：权限不足或文章不存在");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "文章删除失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/unpublisharticle")
    @RequiresPermission("post:create")
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

            boolean result = editArticleService.unpublishArticle(articleId, username);

            if (result) {
                response.put("success", true);
                response.put("message", "文章已取消发布");
            } else {
                response.put("success", false);
                response.put("message", "取消发布失败：权限不足或文章不存在");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "取消发布失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/publisharticle")
    @RequiresPermission("post:create")
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

            // 获取系统配置的默认文章状态
            int articleDefault = SiteConfigMapper.getArticleStatus();

            // 创建一个Map来传递参数，包括要设置的状态
            Map<String, Object> params = new HashMap<>();
            params.put("article_id", articleId);
            params.put("uuid", editArticleService.getArticleUuid(articleId));
            params.put("status", articleDefault);

            // 更新文章状态
            int result = editArticleMapper.publishArticle(params);

            if (result > 0) {
                response.put("success", true);
                response.put("message", "文章已发布");
            } else {
                response.put("success", false);
                response.put("message", "发布失败：权限不足或文章不存在");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "发布失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}
