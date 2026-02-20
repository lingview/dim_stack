package xyz.lingview.dimstack.controller.api.v1;

import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.dto.request.ArticleStatusUpdateRequestDTO;
import xyz.lingview.dimstack.dto.response.ArticleReviewListResponseDTO;
import xyz.lingview.dimstack.dto.response.ArticleReviewStatusResponseDTO;
import xyz.lingview.dimstack.service.ArticleReviewService;
import xyz.lingview.dimstack.domain.Article;
import xyz.lingview.dimstack.common.ApiResponse;

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
    public ApiResponse<ArticleReviewListResponseDTO> getArticleList(@RequestParam(defaultValue = "1") Integer page,
                                                                    @RequestParam(defaultValue = "10") Integer size) {
        return ApiResponse.success(articleReviewService.getUnreviewedArticles(page, size));
    }

    // 根据文章id获取文章内容
    @GetMapping("/getarticlecontent")
    @RequiresPermission("post:review")
    public ApiResponse<Article> getArticleContent(@RequestParam String articleId) {
        return ApiResponse.success(articleReviewService.getArticleContent(articleId));
    }


    // 修改文章状态
    @PostMapping("/articlestatus")
    @RequiresPermission("post:review")
    public ApiResponse<ArticleReviewStatusResponseDTO> updateArticleStatus(@RequestBody ArticleStatusUpdateRequestDTO request) {
        return ApiResponse.success(articleReviewService.updateArticleStatus(request.getArticleId(), request.getStatus()));
    }

    // 获取所有文章列表（用于审核全部文章）
    @GetMapping("/getallarticles")
    @RequiresPermission("post:review")
    public ApiResponse<ArticleReviewListResponseDTO> getAllArticles(@RequestParam(defaultValue = "1") Integer page,
                                                                    @RequestParam(defaultValue = "10") Integer size) {
        return ApiResponse.success(articleReviewService.getAllArticles(page, size));
    }
}
