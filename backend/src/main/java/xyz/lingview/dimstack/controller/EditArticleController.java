package xyz.lingview.dimstack.controller;

import cn.hutool.crypto.digest.BCrypt;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.dto.ArticleDetailDTO;
import xyz.lingview.dimstack.dto.EditArticleDTO;
import xyz.lingview.dimstack.dto.UpdateArticleDTO;
import xyz.lingview.dimstack.service.EditArticleService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EditArticleController {

    @Autowired
    private EditArticleService editArticleService;

    @GetMapping("/getarticlelist")
    public ResponseEntity<Map<String, Object>> getArticleList(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String username = (String) session.getAttribute("username");

            if (username == null) {
                response.put("success", false);
                response.put("message", "用户未登录");
                return ResponseEntity.ok(response);
            }

            List<EditArticleDTO> articles = editArticleService.getArticleListByUsername(username);

            response.put("success", true);
            response.put("message", "获取文章列表成功");
            response.put("data", articles);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取文章列表失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }


    // 文章更新
    @PostMapping("/updatearticle")
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
}
