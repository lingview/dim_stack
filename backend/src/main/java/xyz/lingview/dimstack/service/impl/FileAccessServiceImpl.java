package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.UploadAttachment;
import xyz.lingview.dimstack.service.FileAccessService;
import xyz.lingview.dimstack.service.ImageCompressionService;
import xyz.lingview.dimstack.service.SiteConfigService;
import xyz.lingview.dimstack.service.UploadService;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;

@Slf4j
@Service
public class FileAccessServiceImpl implements FileAccessService {

    @Autowired
    private UploadService uploadService;

    @Autowired
    private ImageCompressionService imageCompressionService;

    @Autowired
    private SiteConfigService siteConfigService;

    @Value("${file.data-root:.}")
    private String dataRoot;

    @Override
    public FileAccessResult getFile(String accessKey, boolean download) {
        UploadAttachment attachment = uploadService.selectByAccessKey(accessKey);
        if (attachment == null) {
            log.warn("未找到访问键对应的文件: {}", accessKey);
            return new FileAccessResult(null, null, null, false);
        }

        Path basePath = Path.of(dataRoot).toAbsolutePath().normalize();
        Path filePath = basePath.resolve(attachment.getAttachment_path()).normalize();

        if (!Files.exists(filePath)) {
            log.warn("文件不存在: {}", filePath);
            return new FileAccessResult(null, null, null, false);
        }

        String contentType = detectContentType(filePath);
        Resource resource = resolveResource(filePath, contentType, download);

        String filename = filePath.getFileName().toString();
        String disposition = buildDisposition(filename, download);

        return new FileAccessResult(resource, contentType, disposition, true);
    }

    private String detectContentType(Path filePath) {
        try {
            String contentType = Files.probeContentType(filePath);
            return contentType != null ? contentType : "application/octet-stream";
        } catch (Exception e) {
            log.warn("探测文件类型失败: {}", filePath, e);
            return "application/octet-stream";
        }
    }

    private Resource resolveResource(Path filePath, String contentType, boolean download) {
        boolean isImage = contentType.startsWith("image/");

        if (isImage && !download) {
            Integer enableCompression = siteConfigService.getEnableImageCompression();
            boolean shouldCompress = enableCompression != null && enableCompression == 1;

            if (shouldCompress) {
                Path compressedPath = getCompressedImagePath(filePath);
                if (Files.exists(compressedPath)) {
                    log.debug("使用压缩图片: {}", compressedPath);
                    return new FileSystemResource(compressedPath.toFile());
                } else {
                    log.debug("压缩图片不存在，使用原图并触发异步压缩: {}", filePath);
                    imageCompressionService.compressImageAsync(filePath.toString());
                }
            }
        }

        return new FileSystemResource(filePath.toFile());
    }

    private String buildDisposition(String filename, boolean download) {
        String encoded = encodeFilename(filename);
        if (download) {
            return "attachment; filename*=UTF-8''" + encoded;
        } else {
            return "inline; filename*=UTF-8''" + encoded;
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

    private Path getCompressedImagePath(Path originalPath) {
        Path parentDir = originalPath.getParent();
        String fileName = originalPath.getFileName().toString();
        int dotIndex = fileName.lastIndexOf('.');
        String baseName = dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName;
        return parentDir.resolve("compressor").resolve(baseName + "_compressed.jpg");
    }
}