package xyz.lingview.dimstack.service;

import org.springframework.web.multipart.MultipartFile;
import xyz.lingview.dimstack.domain.UploadAttachment;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2025/11/12 16:08:35
 * @Description: 文件上传服务
 * @Version: 1.0
 */
public interface UploadService {
    UploadAttachment selectByAccessKey(String accessKey);

    Map<String, String> uploadAttachment(HttpServletRequest request, MultipartFile file);
    Map<String, String> initMultipartUpload(HttpServletRequest request, Map<String, String> payload);
    Map<String, String> uploadChunk(HttpServletRequest request, String uploadId, int chunkIndex, byte[] chunkData);
    Map<String, String> completeUpload(HttpServletRequest request, Map<String, String> payload);
    Map<String, Object> uploadArticle(HttpServletRequest request, xyz.lingview.dimstack.domain.UploadArticle uploadArticle);
    Map<String, String> uploadAvatar(HttpServletRequest request, MultipartFile file);
    Map<String, String> adminUploadAvatar(HttpServletRequest request, MultipartFile file);
    Map<String, String> downloadAndUploadExternalResource(HttpServletRequest request, String url);
}