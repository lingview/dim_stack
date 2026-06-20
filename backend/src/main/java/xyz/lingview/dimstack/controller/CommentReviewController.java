package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.dto.request.CommentDTO;
import xyz.lingview.dimstack.service.BackendCommentService;

import java.util.*;

@RestController
@RequestMapping("/api/commentreview")
@Slf4j
public class CommentReviewController {

    @Autowired
    private BackendCommentService backendCommentService;

    @GetMapping("/pending")
    @RequiresPermission("system:comments:review")
    public ApiResponse<Map<String, Object>> getPendingComments(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<CommentDTO> comments = backendCommentService.getCommentsByStatus(3, page, size);
            int total = backendCommentService.countByStatus(3);
            Map<String, Object> result = new HashMap<>();
            result.put("data", comments);
            result.put("total", total);
            result.put("page", page);
            result.put("size", size);
            result.put("total_pages", (int) Math.ceil((double) total / size));
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("获取待审核评论失败", e);
            return ApiResponse.error(500, "获取待审核评论失败");
        }
    }

    @GetMapping("/all")
    @RequiresPermission("system:comments:review")
    public ApiResponse<Map<String, Object>> getAllComments(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<CommentDTO> comments = backendCommentService.getAllReviewComments(page, size);
            int total = backendCommentService.countAllReview();
            Map<String, Object> result = new HashMap<>();
            result.put("data", comments);
            result.put("total", total);
            result.put("page", page);
            result.put("size", size);
            result.put("total_pages", (int) Math.ceil((double) total / size));
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("获取全部评论失败", e);
            return ApiResponse.error(500, "获取全部评论失败");
        }
    }

    @PutMapping("/{comment_id}/status")
    @RequiresPermission("system:comments:review")
    public ApiResponse<Void> updateStatus(@PathVariable String comment_id,
                                          @RequestBody Map<String, Integer> payload) {
        Integer status = payload.get("status");
        if (status == null) {
            return ApiResponse.error(400, "状态不能为空");
        }
        boolean success = backendCommentService.updateCommentReviewStatus(comment_id, status);
        if (success) {
            return ApiResponse.success("评论状态更新成功");
        } else {
            return ApiResponse.error(400, "评论状态更新失败");
        }
    }
}
