package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.service.LLMService;

import java.util.HashMap;
import java.util.Map;

@RestController
@Slf4j
@RequestMapping("/api/llm")
public class ArticleGenerationController {

    @Autowired
    private LLMService llmService;

    @PostMapping("/generate")
    @RequiresPermission("post:add")
    public ResponseEntity<Map<String, Object>> generateArticle(
            @RequestBody Map<String, String> request,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");
            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            String description = request.get("description");
            if (description == null || description.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "文章描述不能为空");
                return ResponseEntity.ok(response);
            }

            log.info("用户 {} 请求生成文章，描述: {}", username, description.substring(0, Math.min(50, description.length())));

            String generatedContent = llmService.generateArticle(description);

            if (generatedContent != null && !generatedContent.trim().isEmpty()) {
                response.put("success", true);
                response.put("message", "文章生成成功");
                response.put("data", generatedContent);
                log.info("用户 {} 文章生成成功", username);
            } else {
                response.put("success", false);
                response.put("message", "文章生成失败，请检查LLM配置或稍后重试");
                log.warn("用户 {} 文章生成失败，返回内容为空", username);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("文章生成接口异常", e);
            response.put("success", false);
            response.put("message", "文章生成失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}
