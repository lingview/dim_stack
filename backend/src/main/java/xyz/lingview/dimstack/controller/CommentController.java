package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.dto.request.AddCommentRequestDTO;
import xyz.lingview.dimstack.dto.request.CommentDTO;
import xyz.lingview.dimstack.service.CommentService;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // 获取文章的评论列表
    @GetMapping("/article/{articleAlias}")
    public List<CommentDTO> getCommentsByArticle(@PathVariable String articleAlias, HttpSession session) {
        String username = (String) session.getAttribute("username");
        return commentService.getCommentsByArticleAlias(articleAlias, username);
    }

    // 添加评论
    @PostMapping
    public void addComment(@RequestBody AddCommentRequestDTO request, HttpSession session) {
        String username = (String) session.getAttribute("username");
        commentService.addComment(username, request);
    }

    // 点赞评论
    @PostMapping("/{commentId}/like")
    public void likeComment(@PathVariable String commentId, HttpSession session) {
        String username = (String) session.getAttribute("username");
        commentService.likeComment(username, commentId);
    }

    // 删除评论
    @DeleteMapping("/{commentId}")
    public void deleteComment(@PathVariable String commentId, HttpSession session) {
        String username = (String) session.getAttribute("username");
        commentService.deleteComment(username, commentId);
    }
}
