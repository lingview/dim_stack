package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.FileTime;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Stream;

/**
 * @Author: lingview
 * @Date: 2025/12/18 15:43:44
 * @Description: 定时清理用户过期的分片上传目录
 * @Version: 1.0
 */
@Slf4j
@Service
public class TempUploadCleanupService {

    @Value("${file.data-root:.}")
    private String dataRoot;

    @Value("${file.upload-dir:upload}")
    private String uploadDir;


    @Scheduled(cron = "0 0 */6 * * ?")
    public void cleanupExpiredTempUploads() {
        log.info("开始清理超过24小时的临时上传目录...");

        Path uploadBasePath = Paths.get(dataRoot).toAbsolutePath().normalize().resolve(uploadDir);

        if (!Files.exists(uploadBasePath) || !Files.isDirectory(uploadBasePath)) {
            log.warn("上传根目录不存在或无效: {}", uploadBasePath);
            return;
        }

        try (Stream<Path> userDirs = Files.list(uploadBasePath)) {
            userDirs
                    .filter(Files::isDirectory)
                    .forEach(this::cleanupUserTempDirs);
        } catch (IOException e) {
            log.error("无法读取上传根目录: {}", uploadBasePath, e);
        }

        log.info("临时上传目录清理完成。");
    }

    private void cleanupUserTempDirs(Path userDir) {
        String username = userDir.getFileName().toString();
        Path userTempDir = userDir.resolve("temp");

        if (!Files.exists(userTempDir)) {
            return;
        }

        if (!Files.isDirectory(userTempDir)) {
            log.warn("用户 {} 的 temp 路径不是目录，跳过: {}", username, userTempDir);
            return;
        }

        try (Stream<Path> uploadIdDirs = Files.list(userTempDir)) {
            uploadIdDirs
                    .filter(Files::isDirectory)
                    .forEach(uploadIdDir -> {
                        try {
                            FileTime lastModified = Files.getLastModifiedTime(uploadIdDir);
                            long hoursOld = ChronoUnit.HOURS.between(lastModified.toInstant(), Instant.now());

                            if (hoursOld >= 24) {
                                deleteRecursively(uploadIdDir);
                                log.info("已清理用户 {} 的过期临时上传目录（{} 小时前）: {}",
                                        username, hoursOld, uploadIdDir.getFileName());
                            }
                        } catch (IOException e) {
                            log.warn("检查或删除用户 {} 的临时目录失败: {}", username, uploadIdDir, e);
                        }
                    });
        } catch (IOException e) {
            log.warn("无法读取用户 {} 的 temp 目录: {}", username, userTempDir, e);
        }
    }

    private void deleteRecursively(Path dir) {
        try (Stream<Path> walk = Files.walk(dir)) {
            walk.sorted((a, b) -> -a.compareTo(b))
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException e) {
                            log.warn("无法删除临时文件: {}", path, e);
                        }
                    });
        } catch (IOException e) {
            log.warn("遍历临时目录失败: {}", dir, e);
        }
    }
}