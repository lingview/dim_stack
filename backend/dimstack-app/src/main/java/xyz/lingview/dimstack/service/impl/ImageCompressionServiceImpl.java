package xyz.lingview.dimstack.service.impl;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.service.ImageCompressionService;
import xyz.lingview.dimstack.service.SiteConfigService;
import xyz.lingview.dimstack.util.ImageCompressorUtil;
import xyz.lingview.dimstack.util.SiteConfigUtil;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
public class ImageCompressionServiceImpl implements ImageCompressionService {

    @Autowired
    private CacheService cacheService;

    @Autowired
    private SiteConfigUtil siteConfigUtil;

    @Autowired
    private SiteConfigService siteConfigService;

    private static final String COMPRESSION_QUEUE_KEY = "dimstack:image_compression:queue";
    private static final String COMPRESSION_PROCESSING_KEY = "dimstack:image_compression:processing";
    
    private BlockingQueue<String> compressionQueue;
    private Thread[] workerThreads;
    private volatile boolean running = true;
    private AtomicInteger activeWorkers = new AtomicInteger(0);
    private volatile int currentMaxWorkers = 5;

    @PostConstruct
    public void init() {
        Integer threads = siteConfigService.getImageCompressionThreads();
        currentMaxWorkers = (threads != null && threads > 0) ? threads : 5;
        
        compressionQueue = new LinkedBlockingQueue<>(1000);
        workerThreads = new Thread[currentMaxWorkers];
        
        for (int i = 0; i < currentMaxWorkers; i++) {
            workerThreads[i] = new Thread(new CompressionWorker(), "ImageCompression-Worker-" + i);
            workerThreads[i].setDaemon(true);
            workerThreads[i].start();
        }
        
        log.info("图片压缩服务已启动，工作线程数: {}", currentMaxWorkers);
    }

    @PreDestroy
    public void shutdown() {
        running = false;
        for (Thread thread : workerThreads) {
            if (thread != null) {
                thread.interrupt();
            }
        }
        log.info("图片压缩服务已关闭");
    }

    public void updateWorkerThreads() {
        int newThreadCount = siteConfigService.getImageCompressionThreads();
        if (newThreadCount == currentMaxWorkers) {
            log.debug("线程数未变化，无需调整: {}", newThreadCount);
            return;
        }
        
        log.info("检测到线程数配置变化: {} -> {}", currentMaxWorkers, newThreadCount);
        
        if (newThreadCount > currentMaxWorkers) {
            Thread[] newWorkers = new Thread[newThreadCount];
            System.arraycopy(workerThreads, 0, newWorkers, 0, workerThreads.length);
            
            for (int i = currentMaxWorkers; i < newThreadCount; i++) {
                newWorkers[i] = new Thread(new CompressionWorker(), "ImageCompression-Worker-" + i);
                newWorkers[i].setDaemon(true);
                newWorkers[i].start();
                log.info("启动新工作线程: ImageCompression-Worker-{}", i);
            }
            
            workerThreads = newWorkers;
        } else if (newThreadCount < currentMaxWorkers) {
            running = false;
            
            for (int i = 0; i < currentMaxWorkers; i++) {
                if (workerThreads[i] != null) {
                    workerThreads[i].interrupt();
                }
            }
            
            for (int i = 0; i < currentMaxWorkers; i++) {
                if (workerThreads[i] != null) {
                    try {
                        workerThreads[i].join(3000);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
            
            running = true;
            
            Thread[] newWorkers = new Thread[newThreadCount];
            for (int i = 0; i < newThreadCount; i++) {
                newWorkers[i] = new Thread(new CompressionWorker(), "ImageCompression-Worker-" + i);
                newWorkers[i].setDaemon(true);
                newWorkers[i].start();
                log.info("启动新工作线程: ImageCompression-Worker-{}", i);
            }
            
            workerThreads = newWorkers;
        }
        
        currentMaxWorkers = newThreadCount;
        log.info("工作线程数已更新为: {}", currentMaxWorkers);
    }

    @Override
    public void compressImageAsync(String originalImagePath) {
        try {
            Path originalPath = Path.of(originalImagePath);
            if (!Files.exists(originalPath)) {
                log.warn("原图不存在，跳过压缩: {}", originalImagePath);
                return;
            }

            Path compressedPath = getCompressedImagePath(originalPath);
            if (Files.exists(compressedPath)) {
                log.debug("压缩图片已存在，跳过压缩: {}", compressedPath);
                return;
            }

            if (cacheService.isMemberOfSet(COMPRESSION_PROCESSING_KEY, originalImagePath)) {
                log.debug("图片正在压缩中，跳过重复任务: {}", originalImagePath);
                return;
            }

            if (compressionQueue.offer(originalImagePath)) {
                cacheService.addToSet(COMPRESSION_PROCESSING_KEY, originalImagePath);
                log.debug("图片已加入压缩队列: {}, 队列大小: {}", originalImagePath, compressionQueue.size());
            } else {
                log.warn("压缩队列已满，丢弃任务: {}", originalImagePath);
            }
        } catch (Exception e) {
            log.error("添加压缩任务失败: {}", originalImagePath, e);
        }
    }

    private class CompressionWorker implements Runnable {
        @Override
        public void run() {
            log.debug("压缩工作线程启动: {}", Thread.currentThread().getName());
            
            while (running) {
                try {
                    String imagePath = compressionQueue.take();
                    activeWorkers.incrementAndGet();
                    
                    try {
                        processCompression(imagePath);
                    } finally {
                        activeWorkers.decrementAndGet();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    log.error("压缩工作线程异常", e);
                }
            }
            
            log.debug("压缩工作线程退出: {}", Thread.currentThread().getName());
        }

        private void processCompression(String originalImagePath) {
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
                    cacheService.removeFromSet(COMPRESSION_PROCESSING_KEY, originalImagePath);
                    return;
                }
                
                try {
                    String outputPath = compressedPath.toString();
                    ImageCompressorUtil.compress(originalImagePath, outputPath);
                    
                    long originalSize = Files.size(originalPath);
                    long compressedSize = Files.size(compressedPath);
                    double ratio = (1.0 - (double) compressedSize / originalSize) * 100;
                    
                    log.info("图片压缩完成 [{}] - 原图: {} bytes, 压缩后: {} bytes, 压缩率: {}%", 
                            Thread.currentThread().getName(),
                            originalSize, compressedSize, String.format("%.2f", ratio));
                } finally {
                    cacheService.removeFromSet(COMPRESSION_PROCESSING_KEY, originalImagePath);
                }
                    
            } catch (IOException e) {
                log.error("图片压缩失败: {}", originalImagePath, e);
                cacheService.removeFromSet(COMPRESSION_PROCESSING_KEY, originalImagePath);
            } catch (Exception e) {
                log.error("图片压缩过程中发生未知错误: {}", originalImagePath, e);
                cacheService.removeFromSet(COMPRESSION_PROCESSING_KEY, originalImagePath);
            }
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
