package xyz.lingview.dimstack.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RateLimit;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.dto.request.AddCommentRequestDTO;
import xyz.lingview.dimstack.dto.request.CommentDTO;
import xyz.lingview.dimstack.service.CommentService;
import xyz.lingview.dimstack.service.CurrentUserService;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private CurrentUserService currentUserService;

    // 获取文章的评论列表
    @GetMapping("/article/{articleAlias}")
    public ApiResponse<List<CommentDTO>> getCommentsByArticle(@PathVariable String articleAlias) {
        String username = currentUserService.getCurrentUsername();
        List<CommentDTO> comments = commentService.getCommentsByArticleAlias(articleAlias, username);
        return ApiResponse.success(comments);
    }

    // 添加评论
    @PostMapping
    @RateLimit(window = 60, maxRequests = 5)
    @RequiresPermission({"comments:add", "comments:edit"})
    public ApiResponse<Void> addComment(@RequestBody AddCommentRequestDTO request) {
        String username = currentUserService.getCurrentUsername();
        int status = commentService.addComment(username, request);
        if (status == 3) {
            return ApiResponse.success("您的评论已提交，将在审核通过后展示");
        }
        return ApiResponse.success("评论成功");
    }

    // 点赞评论
    @PostMapping("/{commentId}/like")
    @RequiresPermission({"comments:like", "comments:edit"})
    @RateLimit(window = 60, maxRequests = 5)
    public ApiResponse<Void> likeComment(@PathVariable String commentId) {
        String username = currentUserService.getCurrentUsername();
        commentService.likeComment(username, commentId);
        return ApiResponse.success("点赞成功");
    }

    // 删除评论
    @DeleteMapping("/{commentId}")
    @RateLimit(window = 60, maxRequests = 5)
    @RequiresPermission({"comments:delete", "comments:edit"})
    public ApiResponse<Void> deleteComment(@PathVariable String commentId) {
        String username = currentUserService.getCurrentUsername();
        commentService.deleteComment(username, commentId);
        return ApiResponse.success("删除成功");
    }
}