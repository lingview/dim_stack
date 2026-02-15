package xyz.lingview.dimstack.service.impl;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.service.CacheService;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * @Author: lingview
 * @Date: 2026/02/15 20:57:04
 * @Description: 内存缓存实现
 * @Version: 1.0
 */
//@Service
public class MemoryCacheServiceImpl implements CacheService {
    private final Cache<String, Object> cache;
    private final Cache<String, AtomicLong> atomicCounters;
    
    public MemoryCacheServiceImpl() {
        this.cache = Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .build();
                
        this.atomicCounters = Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .build();
    }

    @Override
    public void set(String key, Object value) {
        cache.put(key, value);
    }

    @Override
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        cache.put(key, value);
        if (value instanceof Number) {
            atomicCounters.get(key, k -> new AtomicLong()).set(((Number) value).longValue());
        }
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T> T get(String key, Class<T> type) {
        Object value = cache.getIfPresent(key);
        if (type == Long.class && atomicCounters.getIfPresent(key) != null) {
            return (T) Long.valueOf(atomicCounters.getIfPresent(key).get());
        }
        return (T) value;
    }

    @Override
    public void delete(String key) {
        cache.invalidate(key);
        atomicCounters.invalidate(key);
    }

    @Override
    public void addToSet(String key, Object value) {
        @SuppressWarnings("unchecked")
        Set<Object> set = (Set<Object>) cache.get(key, k -> ConcurrentHashMap.newKeySet());
        set.add(value);
    }

    @Override
    public void removeFromSet(String key, Object value) {
        @SuppressWarnings("unchecked")
        Set<Object> set = (Set<Object>) cache.getIfPresent(key);
        if (set != null) {
            set.remove(value);
        }
    }

    @Override
    public boolean isMemberOfSet(String key, Object value) {
        @SuppressWarnings("unchecked")
        Set<Object> set = (Set<Object>) cache.getIfPresent(key);
        return set != null && set.contains(value);
    }

    @Override
    public void deleteSet(String key) {
        cache.invalidate(key);
    }

    @Override
    public <T> Set<T> getSetMembers(String key, Class<T> type) {
        @SuppressWarnings("unchecked")
        Set<Object> set = (Set<Object>) cache.getIfPresent(key);
        if (set == null) return new java.util.HashSet<>();
        
        Set<T> result = new java.util.HashSet<>();
        for (Object member : set) {
            if (member != null) {
                result.add(type.cast(member));
            }
        }
        return result;
    }

    @Override
    public long incrementAndGet(String key) {
        return atomicCounters.get(key, k -> new AtomicLong()).incrementAndGet();
    }

    @Override
    public long incrementAndGet(String key, long delta) {
        return atomicCounters.get(key, k -> new AtomicLong()).addAndGet(delta);
    }

    @Override
    public long decrementAndGet(String key) {
        return atomicCounters.get(key, k -> new AtomicLong()).decrementAndGet();
    }

    @Override
    public long getAndIncrement(String key) {
        return atomicCounters.get(key, k -> new AtomicLong()).getAndIncrement();
    }

    @Override
    public long getAndDecrement(String key) {
        return atomicCounters.get(key, k -> new AtomicLong()).getAndDecrement();
    }
}