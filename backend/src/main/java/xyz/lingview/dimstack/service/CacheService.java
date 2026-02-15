package xyz.lingview.dimstack.service;

import java.util.concurrent.TimeUnit;

/**
 * @Author: lingview
 * @Date: 2026/02/15 20:47:02
 * @Description: 缓存服务
 * @Version: 1.0
 */
public interface  CacheService {
    void set(String key, Object value);
    void set(String key, Object value, long timeout, TimeUnit unit);
    <T> T get(String key, Class<T> type);
    void delete(String key);

    void addToSet(String key, Object value);
    void removeFromSet(String key, Object value);
    boolean isMemberOfSet(String key, Object value);
    void deleteSet(String key);
    <T> java.util.Set<T> getSetMembers(String key, Class<T> type);

    long incrementAndGet(String key);
    long incrementAndGet(String key, long delta);
    long decrementAndGet(String key);
    long getAndIncrement(String key);
    long getAndDecrement(String key);
}
