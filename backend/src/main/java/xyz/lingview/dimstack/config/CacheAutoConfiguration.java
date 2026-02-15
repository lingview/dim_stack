package xyz.lingview.dimstack.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializer;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.service.impl.MemoryCacheServiceImpl;
import xyz.lingview.dimstack.service.impl.RedisCacheServiceImpl;

@Configuration
@Slf4j
public class CacheAutoConfiguration {

    @Bean
    @Primary
    public CacheService cacheService(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(connectionFactory);
        redisTemplate.setKeySerializer(RedisSerializer.string());
        redisTemplate.setValueSerializer(RedisSerializer.json());
        redisTemplate.setHashKeySerializer(RedisSerializer.string());
        redisTemplate.setHashValueSerializer(RedisSerializer.json());
        redisTemplate.afterPropertiesSet();

        RedisCacheServiceImpl redisImpl = new RedisCacheServiceImpl(redisTemplate);
        if (redisImpl.isRedisAvailable()) {
            log.info("Redis 连接成功，使用 Redis 缓存站点数据");
            return redisImpl;
        } else {
            log.info("Redis 连接失败使用内存缓存站点数据");
            return new MemoryCacheServiceImpl();
        }
    }
}