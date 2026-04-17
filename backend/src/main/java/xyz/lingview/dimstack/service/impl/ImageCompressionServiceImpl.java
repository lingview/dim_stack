package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.service.ImageCompressionService;
import xyz.lingview.dimstack.util.ImageCompressorUtil;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Slf4j
@Service
public class ImageCompressionServiceImpl implements ImageCompressionService {

    @Override
    @Async
    public void compressImageAsync(String originalImagePath) {
        try {
            Path originalPath = Path.of(originalImagePath);
            if (!Files.exists(originalPath)) {
                log.warn("原图不存在，跳过压缩: {}", originalImagePath);
                return;
            }

            Path compressedPath = getCompressedImagePath(originalPath);
            
            Path compressedDir = compressedPath.getParent();
            if (!Files.exists(compressedDir)) {
                Files.createDirectories(compressedDir);
                log.debug("创建压缩目录: {}", compressedDir);
            }

            if (Files.exists(compressedPath)) {
                log.debug("压缩图片已存在，跳过压缩: {}", compressedPath);
                return;
            }

            String outputPath = compressedPath.toString();
            ImageCompressorUtil.compress(originalImagePath, outputPath);
            
            long originalSize = Files.size(originalPath);
            long compressedSize = Files.size(compressedPath);
            double ratio = (1.0 - (double) compressedSize / originalSize) * 100;
            
            log.info("图片压缩完成 - 原图: {} bytes, 压缩后: {} bytes, 压缩率: {}%", 
                    originalSize, compressedSize, String.format("%.2f", ratio));
                    
        } catch (IOException e) {
            log.error("图片压缩失败: {}", originalImagePath, e);
        } catch (Exception e) {
            log.error("图片压缩过程中发生未知错误: {}", originalImagePath, e);
        }
    }

    private Path getCompressedImagePath(Path originalPath) {
        Path parentDir = originalPath.getParent();
        String fileName = originalPath.getFileName().toString();
        int dotIndex = fileName.lastIndexOf('.');
        
        String baseName;
        if (dotIndex > 0) {
            baseName = fileName.substring(0, dotIndex);
        } else {
            baseName = fileName;
        }
        
        String compressedFileName = baseName + "_compressed.jpg";
        return parentDir.resolve("compressor").resolve(compressedFileName);
    }
}
