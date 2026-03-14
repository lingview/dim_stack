package xyz.lingview.dimstack.controller;

import xyz.lingview.dimstack.annotation.RateLimit;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.ReadArticle;
import xyz.lingview.dimstack.service.ReadArticleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/article")
public class ReadArticleController {

    @Autowired
    private ReadArticleService readArticleService;


    @GetMapping("/{alias}/check-password")
    public ResponseEntity<Map<String, Object>> checkArticlePassword(@PathVariable String alias) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean needPassword = readArticleService.isArticleNeedPassword(alias);
            response.put("needPassword", needPassword);
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("检查文章密码失败: ", e);
            response.put("success", false);
            response.put("message", "检查文章密码失败");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{alias}")
    public ResponseEntity<Map<String, Object>> getArticleContent(
            @PathVariable String alias,
            @RequestParam(required = false) String password) {
        Map<String, Object> response = new HashMap<>();
        try {
            ReadArticle article = readArticleService.getArticleByAlias(alias, password);
            log.debug("Article data: {}", article);
            response.put("success", true);
            article.setPassword("******");
            response.put("data", article);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("获取文章内容失败：", e);
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }


    /**
     * 点赞/取消点赞文章
     * @param alias
     * @param session
     * @return
     */
    @RateLimit(window = 60, maxRequests = 5)
    @PostMapping("/{alias}/like")
    public ApiResponse<Map<String, Object>> likeArticle(@PathVariable String alias, HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        try {
            String username = (String) session.getAttribute("username");
            if (username == null) {
                return ApiResponse.error(401, "请先登录后再点赞");
            }
            readArticleService.likeArticle(username, alias);
            response.put("success", true);
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("点赞文章失败：", e);
            response.put("success", false);
            response.put("message", e.getMessage());
            return ApiResponse.error(500, "点赞文章失败");
        }
    }

    /**
     * 获取用户是否已点赞文章
     * @param alias
     * @param session
     * @return
     */
    @GetMapping("/{alias}/liked")
    public ApiResponse<Map<String, Object>> getLikedStatus(@PathVariable String alias, HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        try {
            String username = (String) session.getAttribute("username");
            if (username == null) {
                response.put("liked", false);
                return ApiResponse.success(response);
            }
            boolean liked = readArticleService.isUserLikedArticle(username, alias);
            response.put("liked", liked);
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("获取点赞状态失败：", e);
            response.put("liked", false);
            return ApiResponse.error(500, "获取点赞状态失败");
        }
    }

}
