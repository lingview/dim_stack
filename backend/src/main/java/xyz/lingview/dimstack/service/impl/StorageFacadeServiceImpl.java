package xyz.lingview.dimstack.service.impl;

import tools.jackson.databind.ObjectMapper;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.StorageMethod;
import xyz.lingview.dimstack.mapper.StorageMethodMapper;
import xyz.lingview.dimstack.service.FileStorage;
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

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, S3FileStorageImpl> s3StorageCache = new ConcurrentHashMap<>();

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

        S3FileStorageImpl cached = s3StorageCache.get(storageId);
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

        if ("local".equals(method.getType())) {
            return localFileStorage;
        }

        return initS3Storage(method);
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
            s3StorageCache.put(uuid, newStorage);
            log.info("S3存储初始化完成: {} ({})", method.getName(), uuid);

            return newStorage;
        } catch (Exception e) {
            log.error("初始化S3存储失败: {}", uuid, e);
            throw new RuntimeException("S3存储初始化失败: " + method.getName(), e);
        }
    }

    public void invalidateCache(String uuid) {
        S3FileStorageImpl removed = s3StorageCache.remove(uuid);
        if (removed != null) {
            removed.shutdown();
            log.debug("S3存储缓存已清除: {}", uuid);
        }
    }

    @PreDestroy
    public void shutdown() {
        s3StorageCache.values().forEach(S3FileStorageImpl::shutdown);
        s3StorageCache.clear();
        log.info("所有S3存储连接已关闭");
    }
}