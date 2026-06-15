package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RateLimit;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.service.CurrentUserService;
import xyz.lingview.dimstack.service.LLMService;

import java.util.Map;

@RestController
@Slf4j
@RequestMapping("/api/llm")
public class ArticleGenerationController {

    @Autowired
    private LLMService llmService;

    @Autowired
    private CurrentUserService currentUserService;

    @PostMapping("/generate")
    @RequiresPermission({"post:add","post:edit"})
    @RateLimit(window = 60, maxRequests = 3)
    public ApiResponse<String> generateArticle(
            @RequestBody Map<String, String> request) {
        try {
            String username = currentUserService.getCurrentUsername();
            if (username == null) {
                return ApiResponse.error(401, "用户未登录");
            }

            String description = request.get("description");
            if (description == null || description.trim().isEmpty()) {
                return ApiResponse.error(400, "文章描述不能为空");
            }

            log.info("用户 {} 请求生成文章，描述: {}", username, description.substring(0, Math.min(50, description.length())));

            String generatedContent = llmService.generateArticle(description);

            if (generatedContent != null && !generatedContent.trim().isEmpty()) {
                log.info("用户 {} 文章生成成功", username);
                return ApiResponse.success("文章生成成功", generatedContent);
            } else {
                log.warn("用户 {} 文章生成失败，返回内容为空", username);
                return ApiResponse.error(500, "文章生成失败，请检查LLM配置或稍后重试");
            }

        } catch (Exception e) {
            log.error("文章生成接口异常", e);
            return ApiResponse.error(500, "文章生成失败: " + e.getMessage());
        }
    }
}
