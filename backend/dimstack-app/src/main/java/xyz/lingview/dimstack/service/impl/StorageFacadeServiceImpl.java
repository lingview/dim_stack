package xyz.lingview.dimstack.service.impl;

import tools.jackson.databind.ObjectMapper;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.StorageMethod;
import xyz.lingview.dimstack.mapper.StorageMethodMapper;
import xyz.lingview.dimstack.service.FileStorage;
import xyz.lingview.dimstack.service.SiteConfigService;
import xyz.lingview.dimstack.service.StorageFacadeService;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @Author: lingview
 * @Date: 2026/07/17 20:34:12
 * @Description: 存储选择服务实现
 * @Version: 1.0
 */
@Slf4j
@Service
public class StorageFacadeServiceImpl implements StorageFacadeService {

    @Autowired
    private LocalFileStorageImpl localFileStorage;

    @Autowired
    private StorageMethodMapper storageMethodMapper;

    @Autowired
    private SiteConfigService siteConfigService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, FileStorage> storageCache = new ConcurrentHashMap<>();

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        try {
            String defaultStorageUuid = siteConfigService.getSiteConfig().getDefault_storage();
            if (defaultStorageUuid != null) {
                StorageMethod method = storageMethodMapper.selectByUuid(defaultStorageUuid);
                if (method != null && method.getStatus() == 1 && !"local".equals(method.getType())) {
                    getDefaultStorage(defaultStorageUuid);
                    log.info("默认存储已预热: {}", method.getName());
                }
            }
        } catch (Exception e) {
            log.info("默认存储预热跳过（数据库可能尚未就绪或无外部存储配置）: {}", e.getMessage());
        }
    }

    public FileStorage getDefaultStorage(String defaultStorageUuid) {
        if (defaultStorageUuid == null) {
            return localFileStorage;
        }
        return getStorage(defaultStorageUuid);
    }

    public FileStorage getStorage(String storageId) {
        if (storageId == null) {
            return localFileStorage;
        }

        FileStorage cached = storageCache.get(storageId);
        if (cached != null) {
            return cached;
        }

        // 缓存未命中，同步初始化（防止并发重复创建）
        synchronized (this) {
            cached = storageCache.get(storageId);
            if (cached != null) {
                return cached;
            }

            StorageMethod method = storageMethodMapper.selectByUuid(storageId);
            if (method == null) {
                throw new RuntimeException("存储方式不存在: " + storageId);
            }
            if (method.getStatus() == 0) {
                throw new RuntimeException("存储方式已禁用: " + method.getName());
            }

            String type = method.getType();
            if ("local".equals(type)) {
                return localFileStorage;
            }

            FileStorage newStorage = "webdav".equals(type)
                    ? initWebDavStorage(method)
                    : initS3Storage(method);
            storageCache.put(storageId, newStorage);
            return newStorage;
        }
    }

    private FileStorage initS3Storage(StorageMethod method) {
        String uuid = method.getUuid();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> config = objectMapper.readValue(method.getConfig(), Map.class);

            String endpoint = (String) config.get("endpoint");
            String region = (String) config.get("region");
            String bucket = (String) config.get("bucket");
            String accessKey = (String) config.get("accessKey");
            String secretKey = (String) config.get("secretKey");
            boolean pathStyleAccess = config.get("pathStyleAccess") != null && (boolean) config.get("pathStyleAccess");

            S3FileStorageImpl newStorage = new S3FileStorageImpl(endpoint, region, bucket, accessKey, secretKey, pathStyleAccess);
            log.info("S3存储初始化完成: {} ({})", method.getName(), uuid);

            return newStorage;
        } catch (Exception e) {
            log.error("初始化S3存储失败: {}", uuid, e);
            throw new RuntimeException("S3存储初始化失败: " + method.getName(), e);
        }
    }

    private FileStorage initWebDavStorage(StorageMethod method) {
        String uuid = method.getUuid();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> config = objectMapper.readValue(method.getConfig(), Map.class);

            String url = (String) config.get("url");
            String username = (String) config.get("username");
            String password = (String) config.get("password");

            WebDavFileStorageImpl newStorage = new WebDavFileStorageImpl(url, username, password);
            log.info("WebDAV存储初始化完成: {} ({})", method.getName(), uuid);

            return newStorage;
        } catch (Exception e) {
            log.error("初始化WebDAV存储失败: {}", uuid, e);
            throw new RuntimeException("WebDAV存储初始化失败: " + method.getName(), e);
        }
    }

    public void invalidateCache(String uuid) {
        FileStorage removed = storageCache.remove(uuid);
        if (removed != null) {
            removed.close();
            log.debug("存储缓存已清除: {}", uuid);
        }
    }

    @PreDestroy
    public void shutdown() {
        storageCache.values().forEach(FileStorage::close);
        storageCache.clear();
        log.info("所有外置存储连接已关闭");
    }
}