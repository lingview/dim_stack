package xyz.lingview.dimstack.controller;

import xyz.lingview.dimstack.annotation.RateLimit;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.ReadArticle;
import xyz.lingview.dimstack.service.ReadArticleService;
import xyz.lingview.dimstack.service.CurrentUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/article")
public class ReadArticleController {

    @Autowired
    private ReadArticleService readArticleService;

    @Autowired
    private CurrentUserService currentUserService;


    @GetMapping("/{alias}/check-password")
    public ApiResponse<Map<String, Object>> checkArticlePassword(@PathVariable String alias) {
        try {
            boolean needPassword = readArticleService.isArticleNeedPassword(alias);
            Map<String, Object> data = new HashMap<>();
            data.put("needPassword", needPassword);
            return ApiResponse.success(data);
        } catch (Exception e) {
            log.error("检查文章密码失败: ", e);
            return ApiResponse.error(400, "检查文章密码失败");
        }
    }

    @GetMapping("/{alias}")
    public ApiResponse<ReadArticle> getArticleContent(
            @PathVariable String alias,
            @RequestParam(required = false) String password) {
        try {
            ReadArticle article = readArticleService.getArticleByAlias(alias, password);
            log.debug("Article data: {}", article);
            article.setPassword("******");
            return ApiResponse.success(article);
        } catch (Exception e) {
            log.error("获取文章内容失败：", e);
            return ApiResponse.error(400, e.getMessage());
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
    public ApiResponse<Map<String, Object>> likeArticle(@PathVariable String alias) {
        Map<String, Object> response = new HashMap<>();
        try {
            String username = currentUserService.getCurrentUsername();
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

    // 获取用户是否已点赞文章
    @GetMapping("/{alias}/liked")
    public ApiResponse<Map<String, Object>> getLikedStatus(@PathVariable String alias) {
        Map<String, Object> response = new HashMap<>();
        try {
            String username = currentUserService.getCurrentUsername();
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
