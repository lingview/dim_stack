package xyz.lingview.dimstack.controller.api.v1;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.domain.UploadAttachment;
import xyz.lingview.dimstack.mapper.UploadMapper;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * @Author: lingview
 * @Date: 2025/11/12 09:03:20
 * @Description: 文件访问控制器
 * @Version: 1.0
 */
@Slf4j
@RestController
@RequestMapping("/file")
public class FileAccessController {

    @Autowired
    private UploadMapper uploadMapper;

    @Value("${file.data-root:.}")
    private String dataRoot;

    @Value("${file.upload-dir:upload}")
    private String uploadDir;

    /**
     * 获取文件
     * @param accessKey 访问密钥
     * @param download 是否下载模式 (true=下载, false或不传=预览)
     * @return 文件资源
     */
    @GetMapping("/{accessKey}")
    public ResponseEntity<Resource> getFile(
            @PathVariable String accessKey,
            @RequestParam(required = false, defaultValue = "false") Boolean download) {
        try {
            log.debug("尝试访问文件，访问键: {}, 下载模式: {}", accessKey, download);

            UploadAttachment attachment = uploadMapper.selectByAccessKey(accessKey);
            if (attachment == null) {
                log.warn("未找到访问键对应的文件: {}", accessKey);
                return ResponseEntity.notFound().build();
            }

            Path basePath = Path.of(dataRoot).toAbsolutePath().normalize();
            Path filePath = basePath.resolve(attachment.getAttachment_path()).normalize();

            if (!Files.exists(filePath)) {
                log.warn("文件不存在: {}", filePath);
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(filePath.toFile());

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            String filename = filePath.getFileName().toString();

            String disposition;
            if (download) {
                disposition = "attachment; filename*=UTF-8''" + encodeFilename(filename);
            } else {
                disposition = "inline; filename*=UTF-8''" + encodeFilename(filename);
            }

            log.debug("成功找到文件: {}, 模式: {}", filename, download ? "下载" : "预览");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                    .body(resource);

        } catch (Exception e) {
            log.error("获取文件时发生错误，访问键: {}", accessKey, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private String encodeFilename(String filename) {
        try {
            return URLEncoder.encode(filename, "UTF-8").replace("+", "%20");
        } catch (UnsupportedEncodingException e) {
            log.error("编码文件名失败: {}", filename, e);
            return filename;
        }
    }
}