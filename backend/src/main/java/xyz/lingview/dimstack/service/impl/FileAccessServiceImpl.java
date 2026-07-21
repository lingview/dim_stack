package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.UploadAttachment;
import xyz.lingview.dimstack.service.FileAccessService;
import xyz.lingview.dimstack.service.FileStorage;
import xyz.lingview.dimstack.service.ImageCompressionService;
import xyz.lingview.dimstack.service.SiteConfigService;
import xyz.lingview.dimstack.service.StorageFacadeService;
import xyz.lingview.dimstack.service.UploadService;
import xyz.lingview.dimstack.util.MimeTypeUtil;

import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

@Slf4j
@Service
public class FileAccessServiceImpl implements FileAccessService {

    @Autowired
    private UploadService uploadService;

    @Autowired
    private ImageCompressionService imageCompressionService;

    @Autowired
    private SiteConfigService siteConfigService;

    @Autowired
    private StorageFacadeService storageFacadeService;

    @Value("${file.data-root:.}")
    private String dataRoot;

    @Override
    public FileAccessResult getFile(String accessKey, boolean download) {
        UploadAttachment attachment = uploadService.selectByAccessKey(accessKey);
        if (attachment == null) {
            log.warn("未找到访问键对应的文件: {}", accessKey);
            return new FileAccessResult(null, null, null, false, null);
        }

        String storageId = attachment.getStorage_id();
        try {
            FileStorage storage = storageFacadeService.getStorage(storageId);
            if (storage instanceof LocalFileStorageImpl) {
                return handleLocalStorage(attachment, download);
            }
            return handleExternalStorage(attachment, download, storage);
        } catch (Exception e) {
            log.warn("存储方式不可用，文件无法访问: {}", e.getMessage());
            return new FileAccessResult(null, null, null, false, null);
        }
    }

    private FileAccessResult handleLocalStorage(UploadAttachment attachment, boolean download) {
        Path basePath = Path.of(dataRoot).toAbsolutePath().normalize();
        Path filePath = basePath.resolve(attachment.getAttachment_path()).normalize();

        if (!Files.exists(filePath)) {
            log.warn("文件不存在: {}", filePath);
            return new FileAccessResult(null, null, null, false, null);
        }

        String contentType = detectContentType(filePath);
        Resource resource = resolveResource(filePath, contentType, download);

        String filename = filePath.getFileName().toString();
        String disposition = buildDisposition(filename, download);

        return new FileAccessResult(resource, contentType, disposition, true, null);
    }

    private FileAccessResult handleExternalStorage(UploadAttachment attachment, boolean download, FileStorage storage) {
        if (storage.supportsPresignedUrl()) {
            return handleS3Storage(attachment, download);
        }
        return handleStreamingStorage(attachment, download);
    }

    private FileAccessResult handleS3Storage(UploadAttachment attachment, boolean download) {
        try {
            String objectKey = attachment.getAttachment_path();
            S3FileStorageImpl s3Storage = (S3FileStorageImpl) storageFacadeService.getStorage(attachment.getStorage_id());
            Duration expiration = download ? Duration.ofMinutes(5) : Duration.ofHours(1);
            String presignedUrl = s3Storage.generatePresignedUrl(objectKey, expiration);

            if (download) {
                presignedUrl += "&response-content-disposition=attachment";
            }

            String filename = Path.of(attachment.getAttachment_path()).getFileName().toString();
            String disposition = buildDisposition(filename, download);

            return new FileAccessResult(null, null, disposition, true, presignedUrl);
        } catch (Exception e) {
            log.error("生成Presigned URL失败，回退到本地存储: {}", attachment.getAttachment_id(), e);
            return handleLocalStorage(attachment, download);
        }
    }

    private FileAccessResult handleStreamingStorage(UploadAttachment attachment, boolean download) {
        try {
            FileStorage storage = storageFacadeService.getStorage(attachment.getStorage_id());
            String objectKey = attachment.getAttachment_path();
            InputStream data = storage.retrieve(objectKey);
            String contentType = resolveContentType(attachment);
            String filename = Path.of(objectKey).getFileName().toString();
            String disposition = buildDisposition(filename, download);
            Resource resource = new InputStreamResource(data);
            return new FileAccessResult(resource, contentType, disposition, true, null);
        } catch (Exception e) {
            log.error("流式读取文件失败: {}", attachment.getAttachment_id(), e);
            return new FileAccessResult(null, null, null, false, null);
        }
    }

    private String resolveContentType(UploadAttachment attachment) {
        if (attachment.getContent_type() != null && !attachment.getContent_type().isEmpty()) {
            return attachment.getContent_type();
        }
        String filename = attachment.getOriginal_filename();
        if (filename == null || filename.isEmpty()) {
            filename = attachment.getAttachment_path();
        }
        if (filename != null && filename.contains(".")) {
            String extension = filename.substring(filename.lastIndexOf("."));
            return MimeTypeUtil.getByExtension(extension);
        }
        return "application/octet-stream";
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