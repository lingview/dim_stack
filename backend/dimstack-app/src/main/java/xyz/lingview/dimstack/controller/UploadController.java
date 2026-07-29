package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.UploadArticle;
import xyz.lingview.dimstack.service.UploadService;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
public class UploadController {

    @Autowired
    private UploadService uploadService;

    @PostMapping("/uploadattachment")
    @RequiresPermission("attachment:add")
    public ApiResponse<Map<String, String>> uploadAttachment(HttpServletRequest request,
                                                             @RequestParam("file") MultipartFile file) {
        Map<String, String> result = uploadService.uploadAttachment(request, file);
        if (result != null && !result.containsKey("error")) {
            String message = result.getOrDefault("message", "上传成功");
            return ApiResponse.success(message, result);
        } else {
            String message = result != null ? result.get("error") : "上传失败";
            return ApiResponse.error(400, message, result);
        }
    }

    @PostMapping("/uploadattachment/init")
    @RequiresPermission("attachment:add")
    public ApiResponse<Map<String, String>> initMultipartUpload(HttpServletRequest request,
                                                                @RequestBody Map<String, String> payload) {
        Map<String, String> result = uploadService.initMultipartUpload(request, payload);
        if (result != null && !result.containsKey("error")) {
            return ApiResponse.success(result);
        } else {
            String message = result != null ? result.get("error") : "初始化上传失败";
            return ApiResponse.error(400, message, result);
        }
    }

    @PostMapping("/uploadattachment/part")
    @RequiresPermission("attachment:add")
    public ApiResponse<Map<String, String>> uploadChunk(
            HttpServletRequest request,
            @RequestHeader("Upload-Id") String uploadId,
            @RequestHeader("Chunk-Index") int chunkIndex,
            @RequestBody byte[] chunkData) {
        Map<String, String> result = uploadService.uploadChunk(request, uploadId, chunkIndex, chunkData);
        if (result != null && !result.containsKey("error")) {
            String message = result.getOrDefault("message", "分片上传成功");
            return ApiResponse.success(message, result);
        } else {
            String message = result != null ? result.get("error") : "分片上传失败";
            return ApiResponse.error(400, message, result);
        }
    }

    @PostMapping("/uploadattachment/complete")
    @RequiresPermission("attachment:add")
    public ApiResponse<Map<String, String>> completeUpload(
            HttpServletRequest request,
            @RequestBody Map<String, String> payload) {
        Map<String, String> result = uploadService.completeUpload(request, payload);
        if (result != null && !result.containsKey("error")) {
            return ApiResponse.success(result);
        } else {
            String message = result != null ? result.get("error") : "合并上传失败";
            return ApiResponse.error(400, message, result);
        }
    }

    @PostMapping("/uploadarticle")
    @RequiresPermission({"post:add", "post:edit"})
    public ApiResponse<Map<String, Object>> uploadArticle(HttpServletRequest request,
                                                          @RequestBody UploadArticle uploadArticle) {
        Map<String, Object> result = uploadService.uploadArticle(request, uploadArticle);
        if (result != null && !result.containsKey("error")) {
            String message = result.containsKey("message") ? result.get("message").toString() : "文章保存成功";
            return ApiResponse.success(message, result);
        } else {
            String message = result != null ? result.get("error").toString() : "文章保存失败";
            return ApiResponse.error(400, message, result);
        }
    }

    @PostMapping("/uploadavatar")
    public ApiResponse<Map<String, String>> uploadAvatar(HttpServletRequest request,
                                                         @RequestParam("file") MultipartFile file) {
        Map<String, String> result = uploadService.uploadAvatar(request, file);
        if (result != null && !result.containsKey("error")) {
            String message = result.getOrDefault("message", "上传成功");
            return ApiResponse.success(message, result);
        } else {
            String message = result != null ? result.get("error") : "上传失败";
            return ApiResponse.error(400, message, result);
        }
    }

    // 用户管理模块修改头像用
    @PostMapping("/admin/uploadavatar")
    @RequiresPermission("system:user:management")
    public ApiResponse<Map<String, String>> adminUploadAvatar(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file) {

        Map<String, String> result = uploadService.adminUploadAvatar(request, file);

        if (result != null && !result.containsKey("error")) {
            return ApiResponse.success(result);
        } else {
            String errorMessage = result != null ? result.get("error") : "上传失败";
            return ApiResponse.error(400, errorMessage);
        }
    }

    // 代理下载外部资源
    @PostMapping("/download-external-resource")
    @RequiresPermission("attachment:add")
    public ApiResponse<Map<String, String>> downloadExternalResource(
            HttpServletRequest request,
            @RequestBody Map<String, String> payload) {
        String url = payload.get("url");
        Map<String, String> result = uploadService.downloadAndUploadExternalResource(request, url);
        if (result != null && !result.containsKey("error")) {
            String message = result.getOrDefault("message", "下载成功");
            return ApiResponse.success(message, result);
        } else {
            String message = result != null ? result.get("error") : "下载失败";
            return ApiResponse.error(400, message, result);
        }
    }

}