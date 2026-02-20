package xyz.lingview.dimstack.controller.api.v1;

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
    @RequiresPermission("post:create")
    public ResponseEntity<Map<String, String>> uploadAttachment(HttpServletRequest request,
                                                                @RequestParam("file") MultipartFile file) {
        return uploadService.uploadAttachment(request, file);
    }

    @PostMapping("/uploadattachment/init")
    @RequiresPermission("post:create")
    public ResponseEntity<Map<String, String>> initMultipartUpload(HttpServletRequest request,
                                                                   @RequestBody Map<String, String> payload) {
        return uploadService.initMultipartUpload(request, payload);
    }

    @PostMapping("/uploadattachment/part")
    @RequiresPermission("post:create")
    public ResponseEntity<Map<String, String>> uploadChunk(
            HttpServletRequest request,
            @RequestHeader("Upload-Id") String uploadId,
            @RequestHeader("Chunk-Index") int chunkIndex,
            @RequestBody byte[] chunkData) {
        return uploadService.uploadChunk(request, uploadId, chunkIndex, chunkData);
    }

    @PostMapping("/uploadattachment/complete")
    @RequiresPermission("post:create")
    public ResponseEntity<Map<String, String>> completeUpload(
            HttpServletRequest request,
            @RequestBody Map<String, String> payload) {
        return uploadService.completeUpload(request, payload);
    }

    @PostMapping("/uploadarticle")
    @RequiresPermission("post:create")
    public ResponseEntity<Map<String, Object>> uploadArticle(HttpServletRequest request,
                                                             @RequestBody UploadArticle uploadArticle) {
        return uploadService.uploadArticle(request, uploadArticle);
    }

    @PostMapping("/uploadavatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(HttpServletRequest request,
                                                            @RequestParam("file") MultipartFile file) {
        return uploadService.uploadAvatar(request, file);
    }

    // 用户管理模块修改头像用
    @PostMapping("/admin/uploadavatar")
    @RequiresPermission("user:management")
    public ResponseEntity<ApiResponse<Map<String, String>>> adminUploadAvatar(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file) {

        ResponseEntity<Map<String, String>> result = uploadService.adminUploadAvatar(request, file);

        if (result.getStatusCode().is2xxSuccessful()) {
            Map<String, String> body = result.getBody();
            ApiResponse<Map<String, String>> response = ApiResponse.success(body);
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> body = result.getBody();
            String errorMessage = body != null ? body.get("error") : "上传失败";
            ApiResponse<Map<String, String>> response = ApiResponse.error(
                    result.getStatusCode().value(),
                    errorMessage
            );
            return ResponseEntity.status(result.getStatusCode()).body(response);
        }
    }



}
