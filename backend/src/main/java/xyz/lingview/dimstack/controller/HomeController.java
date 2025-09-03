package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.service.ArticleService;
import xyz.lingview.dimstack.dto.PageRequest;
import xyz.lingview.dimstack.dto.PageResult;
import xyz.lingview.dimstack.dto.ArticleDTO;

@Slf4j
@RestController
@RequestMapping("/api")
public class HomeController {

    @Autowired
    private ArticleService articleService;

    @GetMapping("/articles")
    public PageResult<ArticleDTO> getHomeArticles(PageRequest pageRequest) {
        log.info("接收到获取文章列表请求: page={}, size={}, category={}",
                pageRequest.getPage(), pageRequest.getSize(), pageRequest.getCategory());

        try {
            PageResult<ArticleDTO> result = articleService.getArticlesForHomePage(pageRequest);
            log.info("成功返回文章列表，共{}条记录", result.getTotal());
            return result;
        } catch (Exception e) {
            log.error("获取文章列表时发生错误", e);
            throw e;
        }
    }
}
