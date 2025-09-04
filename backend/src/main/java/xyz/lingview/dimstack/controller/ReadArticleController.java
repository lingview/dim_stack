package xyz.lingview.dimstack.controller;

import xyz.lingview.dimstack.domain.ReadArticle;
import xyz.lingview.dimstack.service.ReadArticleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            response.put("success", true);
            response.put("data", article);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("获取文章内容失败: ", e);
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }


}
