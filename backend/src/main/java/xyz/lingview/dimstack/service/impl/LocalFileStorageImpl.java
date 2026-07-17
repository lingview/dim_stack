package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.service.FileStorage;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;

/**
 * @Author: lingview
 * @Date: 2026/07/17 20:17:33
 * @Description: 本地文件系统存储实现
 * @Version: 1.0
 */
@Slf4j
@Service
public class LocalFileStorageImpl implements FileStorage {

    @Value("${file.data-root:.}")
    private String dataRoot;

    private Path resolvePath(String objectKey) {
        return Path.of(dataRoot).toAbsolutePath().normalize().resolve(objectKey).normalize();
    }

    @Override
    public void store(String objectKey, InputStream data, long contentLength, String contentType) {
        Path filePath = resolvePath(objectKey);
        try {
            Files.createDirectories(filePath.getParent());
            try (OutputStream out = Files.newOutputStream(filePath, StandardOpenOption.CREATE, StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING)) {
                data.transferTo(out);
            }
            log.debug("本地存储写入成功: {}", filePath);
        } catch (IOException e) {
            log.error("本地存储写入失败: {}", filePath, e);
            throw new RuntimeException("文件写入失败", e);
        }
    }

    @Override
    public InputStream retrieve(String objectKey) {
        Path filePath = resolvePath(objectKey);
        try {
            return Files.newInputStream(filePath, StandardOpenOption.READ);
        } catch (IOException e) {
            log.error("本地存储读取失败: {}", filePath, e);
            throw new RuntimeException("文件读取失败", e);
        }
    }

    @Override
    public void delete(String objectKey) {
        Path filePath = resolvePath(objectKey);
        try {
            Files.deleteIfExists(filePath);
            log.debug("本地存储删除成功: {}", filePath);
        } catch (IOException e) {
            log.error("本地存储删除失败: {}", filePath, e);
            throw new RuntimeException("文件删除失败", e);
        }
    }

    @Override
    public boolean exists(String objectKey) {
        return Files.exists(resolvePath(objectKey));
    }

    @Override
    public void copy(String sourceKey, String destKey) {
        Path sourcePath = resolvePath(sourceKey);
        Path destPath = resolvePath(destKey);
        try {
            Files.createDirectories(destPath.getParent());
            Files.copy(sourcePath, destPath, StandardCopyOption.REPLACE_EXISTING);
            log.debug("本地存储拷贝成功: {} -> {}", sourcePath, destPath);
        } catch (IOException e) {
            log.error("本地存储拷贝失败: {} -> {}", sourcePath, destPath, e);
            throw new RuntimeException("文件拷贝失败", e);
        }
    }

    @Override
    public String getType() {
        return "local";
    }
}