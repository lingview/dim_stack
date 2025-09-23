package xyz.lingview.dimstack.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.domain.Comment;
import xyz.lingview.dimstack.dto.request.CommentDTO;
import xyz.lingview.dimstack.service.BackendCommentService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/backentcomments")
public class BackentCommentController {

    @Autowired
    private BackendCommentService backendCommentService;

    // 获取指定文章的所有评论
    @GetMapping("/article/{article_id}")
    @RequiresPermission("post:review")
    public ResponseEntity<Map<String, Object>> getCommentsByArticleId(@PathVariable String article_id) {
        List<CommentDTO> comments = backendCommentService.getCommentsByArticleId(article_id);
        String articleTitle = backendCommentService.getArticleTitle(article_id);

        Map<String, Object> result = new HashMap<>();
        result.put("comments", comments);
        result.put("articleTitle", articleTitle);
        result.put("article_id", article_id);

        return ResponseEntity.ok(result);
    }

    // 获取评论详情
    @GetMapping("/{comment_id}")
    @RequiresPermission("post:review")
    public ResponseEntity<Comment> getCommentDetail(@PathVariable String comment_id) {
        Comment comment = backendCommentService.getCommentDetail(comment_id);
        if (comment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(comment);
    }

    // 修改评论内容
    @PutMapping("/{comment_id}")
    @RequiresPermission("post:review")
    public ResponseEntity<Map<String, Object>> updateComment(@PathVariable String comment_id,
                                                             @RequestBody Map<String, String> payload) {
        String content = payload.get("content");
        if (content == null || content.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "评论内容不能为空");
            return ResponseEntity.badRequest().body(error);
        }

        boolean success = backendCommentService.updateCommentContent(comment_id, content);
        Map<String, Object> result = new HashMap<>();
        if (success) {
            result.put("message", "评论更新成功");
        } else {
            result.put("error", "评论更新失败");
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    // 删除评论
    @DeleteMapping("/{comment_id}")
    @RequiresPermission("post:review")
    public ResponseEntity<Map<String, Object>> deleteComment(@PathVariable String comment_id) {
        boolean success = backendCommentService.deleteComment(comment_id);
        Map<String, Object> result = new HashMap<>();
        if (success) {
            result.put("message", "评论删除成功");
        } else {
            result.put("error", "评论删除失败");
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }


    // 分页获取所有评论
    @GetMapping
    @RequiresPermission("post:review")
    public ResponseEntity<Map<String, Object>> getAllComments(@RequestParam(defaultValue = "1") int page,
                                                              @RequestParam(defaultValue = "10") int size) {
        List<CommentDTO> comments = backendCommentService.getAllCommentsWithPagination(page, size);
        int totalComments = backendCommentService.getTotalCommentsCount();
        int totalPages = (int) Math.ceil((double) totalComments / size);

        Map<String, Object> response = new HashMap<>();
        response.put("comments", comments);
        response.put("currentPage", page);
        response.put("totalPages", totalPages);
        response.put("totalComments", totalComments);
        response.put("pageSize", size);

        return ResponseEntity.ok(response);
    }
}
