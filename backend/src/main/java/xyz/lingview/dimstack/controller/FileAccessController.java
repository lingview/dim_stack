package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.domain.UploadAttachment;
import xyz.lingview.dimstack.mapper.UploadMapper;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

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

    @GetMapping("/{accessKey}")
    public ResponseEntity<Resource> getFile(@PathVariable String accessKey) {
        try {
            log.debug("尝试访问文件，访问键: {}", accessKey);

            UploadAttachment attachment = uploadMapper.selectByAccessKey(accessKey);
            if (attachment == null) {
                log.warn("未找到访问键对应的文件: {}", accessKey);
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(attachment.getAttachment_path());

            if (!Files.exists(filePath)) {
                log.warn("文件不存在: {}", filePath);
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(filePath.toFile());

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            log.debug("成功找到文件: {}", filePath.getFileName());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + filePath.getFileName().toString() + "\"")
                    .body(resource);

        } catch (Exception e) {
            log.error("获取文件时发生错误，访问键: {}", accessKey, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
