package xyz.lingview.dimstack.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.service.ArticleSearchService;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/articlesearch")
public class ArticleSearchController {

    @Autowired
    private ArticleSearchService articleSearchService;

    @GetMapping("/search")
    public Map<String, Object> searchArticles(@RequestParam(required = false) String keyword) {
        try {
            List<Article> articles = articleSearchService.searchArticles(keyword);

            List<Map<String, Object>> articleInfoList = articles.stream()
                .map(article -> {
                    Map<String, Object> info = new HashMap<>();
                    info.put("title", article.getArticle_name());
                    info.put("alias", article.getAlias());
                    info.put("id", article.getId());
                    info.put("excerpt", article.getExcerpt());
                    return info;
                })
                .collect(Collectors.toList());

            return Map.of(
                "success", true,
                "data", articleInfoList,
                "count", articles.size()
            );
        } catch (Exception e) {
            return Map.of(
                "success", false,
                "message", "搜索失败: " + e.getMessage()
            );
        }
    }
}
