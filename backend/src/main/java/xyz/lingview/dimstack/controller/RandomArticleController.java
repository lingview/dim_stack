package xyz.lingview.dimstack.controller;

import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.ReadArticle;
import xyz.lingview.dimstack.service.ReadArticleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/random-article")
public class RandomArticleController {

    @Autowired
    private ReadArticleService readArticleService;

    @GetMapping
    public ApiResponse<ReadArticle> getRandomArticle() {
        try {
            ReadArticle article = readArticleService.getRandomArticle();
            if (article == null) {
                return ApiResponse.error(404, "暂无已发布的文章");
            }
            article.setPassword("******");
            return ApiResponse.success(article);
        } catch (Exception e) {
            log.error("获取随机文章失败：", e);
            return ApiResponse.error(500, "获取随机文章失败");
        }
    }
}
