package xyz.lingview.dimstack.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.Comment;
import xyz.lingview.dimstack.dto.request.CommentDTO;
import xyz.lingview.dimstack.service.BackendCommentService;
import java.util.ArrayList;
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
    @RequiresPermission({"system:comments:view", "system:comments:management"})
    public ApiResponse<Map<String, Object>> getCommentsByArticleId(@PathVariable String article_id) {
        List<CommentDTO> comments = backendCommentService.getCommentsByArticleId(article_id);
        String articleTitle = backendCommentService.getArticleTitle(article_id);

        Map<String, Object> result = new HashMap<>();
        result.put("comments", comments);
        result.put("articleTitle", articleTitle);
        result.put("article_id", article_id);

        return ApiResponse.success(result);
    }

    // 获取评论详情
    @GetMapping("/{comment_id}")
    @RequiresPermission({"system:comments:view", "system:comments:management"})
    public ApiResponse<Comment> getCommentDetail(@PathVariable String comment_id) {
        Comment comment = backendCommentService.getCommentDetail(comment_id);
        if (comment == null) {
            return ApiResponse.error(404, "评论不存在");
        }
        return ApiResponse.success(comment);
    }

    // 修改评论内容
    @PutMapping("/{comment_id}")
    @RequiresPermission({"system:comments:edit", "system:comments:management"})
    public ApiResponse<Void> updateComment(@PathVariable String comment_id,
                                           @RequestBody Map<String, String> payload) {
        String content = payload.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ApiResponse.error(400, "评论内容不能为空");
        }

        boolean success = backendCommentService.updateCommentContent(comment_id, content);
        if (success) {
            return ApiResponse.success("评论更新成功");
        } else {
            return ApiResponse.error(400, "评论更新失败");
        }
    }

    // 修改评论时间
    @PutMapping("/{comment_id}/time")
    @RequiresPermission({"system:comments:edit", "system:comments:management"})
    public ApiResponse<Void> updateCommentTime(@PathVariable String comment_id,
                                               @RequestBody Map<String, String> payload) {
        String create_time = payload.get("create_time");
        if (create_time == null || create_time.trim().isEmpty()) {
            return ApiResponse.error(400, "评论时间不能为空");
        }

        boolean success = backendCommentService.updateCommentTime(comment_id, create_time);
        if (success) {
            return ApiResponse.success("评论时间更新成功");
        } else {
            return ApiResponse.error(400, "评论时间更新失败");
        }
    }

    // 修改评论用户
    @PutMapping("/{comment_id}/user")
    @RequiresPermission({"system:comments:edit", "system:comments:management"})
    public ApiResponse<Void> updateCommentUser(@PathVariable String comment_id,
                                               @RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        if (username == null || username.trim().isEmpty()) {
            return ApiResponse.error(400, "用户名不能为空");
        }

        boolean success = backendCommentService.updateCommentUser(comment_id, username);
        if (success) {
            return ApiResponse.success("评论用户更新成功");
        } else {
            return ApiResponse.error(400, "用户不存在或更新失败");
        }
    }

    // 搜索用户
    @GetMapping("/users/search")
    @RequiresPermission({"system:comments:edit", "system:comments:management"})
    public ApiResponse<List<Map<String, Object>>> searchUsers(@RequestParam String q) {
        if (q == null || q.trim().isEmpty()) {
            return ApiResponse.success(new ArrayList<>());
        }
        List<Map<String, Object>> users = backendCommentService.searchUsers(q.trim());
        return ApiResponse.success(users);
    }

    // 删除评论
    @DeleteMapping("/{comment_id}")
    @RequiresPermission({"system:comments:delete", "system:comments:management"})
    public ApiResponse<Void> deleteComment(@PathVariable String comment_id) {
        boolean success = backendCommentService.deleteComment(comment_id);
        if (success) {
            return ApiResponse.success("评论删除成功");
        } else {
            return ApiResponse.error(400, "评论删除失败");
        }
    }


    // 分页获取所有评论
    @GetMapping
    @RequiresPermission({"system:comments:view", "system:comments:management"})
    public ApiResponse<Map<String, Object>> getAllComments(@RequestParam(defaultValue = "1") int page,
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

        return ApiResponse.success(response);
    }
}
