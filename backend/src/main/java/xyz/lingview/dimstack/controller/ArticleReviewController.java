package xyz.lingview.dimstack.controller;

import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.service.ArticleReviewService;
import xyz.lingview.dimstack.dto.ArticleReviewDTO;
import xyz.lingview.dimstack.domain.Article;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/articlereview")
public class ArticleReviewController {

    private final ArticleReviewService articleReviewService;

    public ArticleReviewController(ArticleReviewService articleReviewService) {
        this.articleReviewService = articleReviewService;
    }

    // 获取未审核的文章列表
    @GetMapping("/getarticlelist")
    @RequiresPermission("post:review")
    public Map<String, Object> getArticleList(@RequestParam(defaultValue = "1") Integer page,
                                              @RequestParam(defaultValue = "10") Integer size) {
        return articleReviewService.getUnreviewedArticles(page, size);
    }

    // 根据文章id获取文章内容
    @GetMapping("/getarticlecontent")
    @RequiresPermission("post:review")
    public Article getArticleContent(@RequestParam String articleId) {
        return articleReviewService.getArticleContent(articleId);
    }

    // 修改文章状态
    @PostMapping("/articlestatus")
    @RequiresPermission("post:review")
    public Map<String, Object> updateArticleStatus(@RequestBody Map<String, Object> request) {
        String articleId = (String) request.get("articleId");
        Byte status = ((Integer) request.get("status")).byteValue();
        return articleReviewService.updateArticleStatus(articleId, status);
    }
}
