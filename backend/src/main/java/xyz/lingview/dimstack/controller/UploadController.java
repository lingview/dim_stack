package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
        ResponseEntity<Map<String, String>> result = uploadService.uploadAttachment(request, file);
        Map<String, String> body = result.getBody();
        if (result.getStatusCode().is2xxSuccessful()) {
            String message = body != null && body.get("message") != null ? body.get("message") : "上传成功";
            return ApiResponse.success(message, body);
        } else {
            String message = body != null && body.get("error") != null ? body.get("error") : "上传失败";
            return ApiResponse.error(result.getStatusCode().value(), message, body);
        }
    }

    @PostMapping("/uploadattachment/init")
    @RequiresPermission("attachment:add")
    public ApiResponse<Map<String, String>> initMultipartUpload(HttpServletRequest request,
                                                                @RequestBody Map<String, String> payload) {
        ResponseEntity<Map<String, String>> result = uploadService.initMultipartUpload(request, payload);
        Map<String, String> body = result.getBody();
        if (result.getStatusCode().is2xxSuccessful()) {
            return ApiResponse.success(body);
        } else {
            String message = body != null && body.get("error") != null ? body.get("error") : "初始化上传失败";
            return ApiResponse.error(result.getStatusCode().value(), message, body);
        }
    }

    @PostMapping("/uploadattachment/part")
    @RequiresPermission("attachment:add")
    public ApiResponse<Map<String, String>> uploadChunk(
            HttpServletRequest request,
            @RequestHeader("Upload-Id") String uploadId,
            @RequestHeader("Chunk-Index") int chunkIndex,
            @RequestBody byte[] chunkData) {
        ResponseEntity<Map<String, String>> result = uploadService.uploadChunk(request, uploadId, chunkIndex, chunkData);
        Map<String, String> body = result.getBody();
        if (result.getStatusCode().is2xxSuccessful()) {
            String message = body != null && body.get("message") != null ? body.get("message") : "分片上传成功";
            return ApiResponse.success(message, body);
        } else {
            String message = body != null && body.get("error") != null ? body.get("error") : "分片上传失败";
            return ApiResponse.error(result.getStatusCode().value(), message, body);
        }
    }

    @PostMapping("/uploadattachment/complete")
    @RequiresPermission("attachment:add")
    public ApiResponse<Map<String, String>> completeUpload(
            HttpServletRequest request,
            @RequestBody Map<String, String> payload) {
        ResponseEntity<Map<String, String>> result = uploadService.completeUpload(request, payload);
        Map<String, String> body = result.getBody();
        if (result.getStatusCode().is2xxSuccessful()) {
            return ApiResponse.success(body);
        } else {
            String message = body != null && body.get("error") != null ? body.get("error") : "合并上传失败";
            return ApiResponse.error(result.getStatusCode().value(), message, body);
        }
    }

    @PostMapping("/uploadarticle")
    @RequiresPermission({"post:add", "post:edit"})
    public ApiResponse<Map<String, Object>> uploadArticle(HttpServletRequest request,
                                                          @RequestBody UploadArticle uploadArticle) {
        ResponseEntity<Map<String, Object>> result = uploadService.uploadArticle(request, uploadArticle);
        Map<String, Object> body = result.getBody();
        if (result.getStatusCode().is2xxSuccessful()) {
            String message = body != null && body.get("message") != null
                    ? body.get("message").toString() : "文章保存成功";
            return ApiResponse.success(message, body);
        } else {
            String message = body != null && body.get("error") != null
                    ? body.get("error").toString() : "文章保存失败";
            return ApiResponse.error(result.getStatusCode().value(), message, body);
        }
    }

    @PostMapping("/uploadavatar")
    public ApiResponse<Map<String, String>> uploadAvatar(HttpServletRequest request,
                                                         @RequestParam("file") MultipartFile file) {
        ResponseEntity<Map<String, String>> result = uploadService.uploadAvatar(request, file);
        Map<String, String> body = result.getBody();
        if (result.getStatusCode().is2xxSuccessful()) {
            String message = body != null && body.get("message") != null ? body.get("message") : "上传成功";
            return ApiResponse.success(message, body);
        } else {
            String message = body != null && body.get("error") != null ? body.get("error") : "上传失败";
            return ApiResponse.error(result.getStatusCode().value(), message, body);
        }
    }

    // 用户管理模块修改头像用
    @PostMapping("/admin/uploadavatar")
    @RequiresPermission("system:user:management")
    public ApiResponse<Map<String, String>> adminUploadAvatar(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file) {

        ResponseEntity<Map<String, String>> result = uploadService.adminUploadAvatar(request, file);

        if (result.getStatusCode().is2xxSuccessful()) {
            Map<String, String> body = result.getBody();
            return ApiResponse.success(body);
        } else {
            Map<String, String> body = result.getBody();
            String errorMessage = body != null ? body.get("error") : "上传失败";
            return ApiResponse.error(result.getStatusCode().value(), errorMessage);
        }
    }

    // 代理下载外部资源
    @PostMapping("/download-external-resource")
    @RequiresPermission("attachment:add")
    public ApiResponse<Map<String, String>> downloadExternalResource(
            HttpServletRequest request,
            @RequestBody Map<String, String> payload) {
        String url = payload.get("url");
        ResponseEntity<Map<String, String>> result = uploadService.downloadAndUploadExternalResource(request, url);
        Map<String, String> body = result.getBody();
        if (result.getStatusCode().is2xxSuccessful()) {
            String message = body != null && body.get("message") != null ? body.get("message") : "下载成功";
            return ApiResponse.success(message, body);
        } else {
            String message = body != null && body.get("error") != null ? body.get("error") : "下载失败";
            return ApiResponse.error(result.getStatusCode().value(), message, body);
        }
    }

}