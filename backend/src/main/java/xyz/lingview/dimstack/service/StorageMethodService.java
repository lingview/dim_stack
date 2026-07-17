package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.StorageMethod;

import java.util.List;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2026/07/17 20:12:05
 * @Description: 存储方式管理服务
 * @Version: 1.0
 */
public interface StorageMethodService {
    List<StorageMethod> list();

    StorageMethod getByUuid(String uuid);

    Map<String, String> add(StorageMethod storageMethod, String userUuid);

    Map<String, String> edit(StorageMethod storageMethod);

    Map<String, String> disable(String uuid);

    Map<String, String> enable(String uuid);

    Map<String, String> deletePhysical(String uuid);

    Map<String, String> setDefault(String uuid);
}