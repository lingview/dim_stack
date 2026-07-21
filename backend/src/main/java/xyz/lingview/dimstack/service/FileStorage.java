package xyz.lingview.dimstack.service;

import java.io.InputStream;

/**
 * @Author: lingview
 * @Date: 2026/07/17 21:23:12
 * @Description: 文件存储抽象接口，定义所有存储后端统一操作
 * @Version: 1.0
 */
public interface FileStorage {

    void store(String objectKey, InputStream data, long contentLength, String contentType);

    InputStream retrieve(String objectKey);

    void delete(String objectKey);

    boolean exists(String objectKey);

    void copy(String sourceKey, String destKey);

    String getType();

    default boolean supportsPresignedUrl() {
        return false;
    }

    default void close() {
    }
}