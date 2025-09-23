package xyz.lingview.dimstack.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.dto.response.ArticleSearchResponseDTO;
import xyz.lingview.dimstack.dto.response.ArticleSearchResultDTO;
import xyz.lingview.dimstack.service.ArticleSearchService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/articlesearch")
public class ArticleSearchController {

    @Autowired
    private ArticleSearchService articleSearchService;

    @GetMapping("/search")
    public ApiResponse<ArticleSearchResponseDTO> searchArticles(@RequestParam(required = false) String keyword) {
        try {
            List<Article> articles = articleSearchService.searchArticles(keyword);

            List<ArticleSearchResultDTO> articleInfoList = articles.stream()
                .map(article -> {
                    ArticleSearchResultDTO info = new ArticleSearchResultDTO();
                    info.setTitle(article.getArticle_name());
                    info.setAlias(article.getAlias());
                    info.setId(article.getId());
                    info.setExcerpt(article.getExcerpt());
                    return info;
                })
                .collect(Collectors.toList());

            ArticleSearchResponseDTO responseDTO = new ArticleSearchResponseDTO();
            responseDTO.setData(articleInfoList);
            responseDTO.setCount(articles.size());

            return ApiResponse.success(responseDTO);
        } catch (Exception e) {
            return ApiResponse.error(500, "搜索失败: " + e.getMessage());
        }
    }
}
