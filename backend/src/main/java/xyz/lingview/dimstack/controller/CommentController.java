package xyz.lingview.dimstack.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RateLimit;
import xyz.lingview.dimstack.annotation.RequiresPermission;
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
    public List<CommentDTO> getCommentsByArticle(@PathVariable String articleAlias) {
        String username = currentUserService.getCurrentUsername();
        return commentService.getCommentsByArticleAlias(articleAlias, username);
    }

    // 添加评论
    @PostMapping
    @RateLimit(window = 60, maxRequests = 5)
    @RequiresPermission({"comments:add", "comments:edit"})
    public void addComment(@RequestBody AddCommentRequestDTO request) {
        String username = currentUserService.getCurrentUsername();
        commentService.addComment(username, request);
    }

    // 点赞评论
    @PostMapping("/{commentId}/like")
    @RequiresPermission({"comments:like", "comments:edit"})
    @RateLimit(window = 60, maxRequests = 5)
    public void likeComment(@PathVariable String commentId) {
        String username = currentUserService.getCurrentUsername();
        commentService.likeComment(username, commentId);
    }

    // 删除评论
    @DeleteMapping("/{commentId}")
    @RateLimit(window = 60, maxRequests = 5)
    @RequiresPermission({"comments:delete", "comments:edit"})
    public void deleteComment(@PathVariable String commentId) {
        String username = currentUserService.getCurrentUsername();
        commentService.deleteComment(username, commentId);
    }
}
