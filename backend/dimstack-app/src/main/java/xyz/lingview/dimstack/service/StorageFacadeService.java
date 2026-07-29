package xyz.lingview.dimstack.service;

/**
 * @Author: lingview
 * @Date: 2026/07/17 20:08:42
 * @Description: 存储选择服务接口
 * @Version: 1.0
 */
public interface StorageFacadeService {

    FileStorage getDefaultStorage(String defaultStorageUuid);

    FileStorage getStorage(String storageId);

    void invalidateCache(String uuid);
}