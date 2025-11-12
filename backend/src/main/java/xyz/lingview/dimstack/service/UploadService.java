package xyz.lingview.dimstack.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2025/11/12 16:08:35
 * @Description: 文件上传服务
 * @Version: 1.0
 */
public interface UploadService {
    ResponseEntity<Map<String, String>> uploadAttachment(HttpServletRequest request, MultipartFile file);
    ResponseEntity<Map<String, String>> initMultipartUpload(HttpServletRequest request, Map<String, String> payload);
    ResponseEntity<Map<String, String>> uploadChunk(HttpServletRequest request, String uploadId, int chunkIndex, byte[] chunkData);
    ResponseEntity<Map<String, String>> completeUpload(HttpServletRequest request, Map<String, String> payload);
    ResponseEntity<Map<String, Object>> uploadArticle(HttpServletRequest request, xyz.lingview.dimstack.domain.UploadArticle uploadArticle);
    ResponseEntity<Map<String, String>> uploadAvatar(HttpServletRequest request, MultipartFile file);
}