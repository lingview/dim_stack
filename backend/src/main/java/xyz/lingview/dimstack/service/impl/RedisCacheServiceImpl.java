package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.service.CacheService;

import java.util.concurrent.TimeUnit;

/**
 * @Author: lingview
 * @Date: 2026/02/15 20:56:16
 * @Description: Redis缓存实现
 * @Version: 1.0
 */
//@Service
@Slf4j
public class RedisCacheServiceImpl implements CacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final boolean redisAvailable;

    public RedisCacheServiceImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;

        boolean available;
        try {
            redisTemplate.getConnectionFactory().getConnection().ping();
            available = true;
        } catch (Exception e) {
            log.info("Redis 不可用");
            available = false;
        }
        this.redisAvailable = available;
    }

    @Override
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        if (redisAvailable) {
            redisTemplate.opsForValue().set(key, value, timeout, unit);
        }
    }

    @Override
    public void set(String key, Object value) {
        if (redisAvailable) {
            redisTemplate.opsForValue().set(key, value);
        }
    }

    @Override
    public <T> T get(String key, Class<T> type) {
        if (!redisAvailable) return null;
        try {
            Object obj = redisTemplate.opsForValue().get(key);
            return obj != null ? type.cast(obj) : null;
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public void delete(String key) {
        if (redisAvailable) {
            redisTemplate.delete(key);
        }
    }

    @Override
    public void addToSet(String key, Object value) {
        if (redisAvailable) {
            redisTemplate.opsForSet().add(key, value);
        }
    }

    @Override
    public void removeFromSet(String key, Object value) {
        if (redisAvailable) {
            redisTemplate.opsForSet().remove(key, value);
        }
    }

    @Override
    public boolean isMemberOfSet(String key, Object value) {
        if (!redisAvailable) return false;
        try {
            return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(key, value));
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public void deleteSet(String key) {
        if (redisAvailable) {
            redisTemplate.delete(key);
        }
    }

    @Override
    public <T> java.util.Set<T> getSetMembers(String key, Class<T> type) {
        if (!redisAvailable) return new java.util.HashSet<>();
        try {
            java.util.Set<Object> members = redisTemplate.opsForSet().members(key);
            if (members == null) return new java.util.HashSet<>();
            
            java.util.Set<T> result = new java.util.HashSet<>();
            for (Object member : members) {
                if (member != null) {
                    result.add(type.cast(member));
                }
            }
            return result;
        } catch (Exception e) {
            return new java.util.HashSet<>();
        }
    }

    public boolean isRedisAvailable() {
        return redisAvailable;
    }

    @Override
    public long incrementAndGet(String key) {
        if (!redisAvailable) return 0L;
        try {
            return redisTemplate.opsForValue().increment(key, 1L);
        } catch (Exception e) {
            return 0L;
        }
    }

    @Override
    public long incrementAndGet(String key, long delta) {
        if (!redisAvailable) return 0L;
        try {
            return redisTemplate.opsForValue().increment(key, delta);
        } catch (Exception e) {
            return 0L;
        }
    }

    @Override
    public long decrementAndGet(String key) {
        if (!redisAvailable) return 0L;
        try {
            return redisTemplate.opsForValue().increment(key, -1L);
        } catch (Exception e) {
            return 0L;
        }
    }

    @Override
    public long getAndIncrement(String key) {
        if (!redisAvailable) return 0L;
        try {
            Long currentValue = (Long) redisTemplate.opsForValue().get(key);
            long result = currentValue != null ? currentValue : 0L;
            redisTemplate.opsForValue().increment(key, 1L);
            return result;
        } catch (Exception e) {
            return 0L;
        }
    }

    @Override
    public long getAndDecrement(String key) {
        if (!redisAvailable) return 0L;
        try {
            Long currentValue = (Long) redisTemplate.opsForValue().get(key);
            long result = currentValue != null ? currentValue : 0L;
            redisTemplate.opsForValue().increment(key, -1L);
            return result;
        } catch (Exception e) {
            return 0L;
        }
    }
}
