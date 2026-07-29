package xyz.lingview.dimstack.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializer;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.service.impl.MemoryCacheServiceImpl;
import xyz.lingview.dimstack.service.impl.RedisCacheServiceImpl;

import jakarta.annotation.PostConstruct;

@Configuration
@Slf4j
public class CacheAutoConfiguration {

    @Value("${app.redis.enabled:#{null}}")
    private Boolean appRedisEnabled;

    @Value("${spring.data.redis.host:}")
    private String redisHost;

    @Value("${spring.data.redis.port:0}")
    private int redisPort;

    @PostConstruct
    public void initialize() {
        RedisMode mode = determineRedisMode();
        log.info("缓存模式: {}", mode);
    }

    @Bean
    @Primary
    public CacheService cacheService(RedisConnectionFactory connectionFactory) {
        RedisMode mode = determineRedisMode();

        switch (mode) {
            case REDIS_ENABLED:
            case REDIS_COMPATIBILITY:
                return createRedisCacheService(connectionFactory);
            case MEMORY_ONLY:
                return createMemoryCacheService();
            default:
                throw new IllegalStateException("未知的Redis模式");
        }
    }


    private RedisMode determineRedisMode() {
        if (appRedisEnabled != null && appRedisEnabled) {
            log.info("检测到 app.redis.enabled=true，使用Redis模式");
            return RedisMode.REDIS_ENABLED;
        }

        if (appRedisEnabled != null && !appRedisEnabled) {
            log.info("检测到 app.redis.enabled=false，使用内存模式");
            return RedisMode.MEMORY_ONLY;
        }

        if (hasRedisConfiguration()) {
            log.info("未配置 app.redis.enabled，但检测到Redis连接配置，启用兼容模式，请尽快重新生成配置文件，后续版本可能放弃该兼容");
            return RedisMode.REDIS_COMPATIBILITY;
        }

        log.info("未检测到任何Redis配置，使用内存模式");
        return RedisMode.MEMORY_ONLY;
    }

    private CacheService createRedisCacheService(RedisConnectionFactory connectionFactory) {
        try {
            RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
            redisTemplate.setConnectionFactory(connectionFactory);
            redisTemplate.setKeySerializer(RedisSerializer.string());
            redisTemplate.setValueSerializer(RedisSerializer.json());
            redisTemplate.setHashKeySerializer(RedisSerializer.string());
            redisTemplate.setHashValueSerializer(RedisSerializer.json());
            redisTemplate.afterPropertiesSet();

            RedisCacheServiceImpl redisImpl = new RedisCacheServiceImpl(redisTemplate);
            if (redisImpl.isRedisAvailable()) {
                log.info("Redis 连接成功，使用 Redis 缓存");
                return redisImpl;
            } else {
                String errorMsg = "Redis连接失败：无法连接到Redis服务器，请检查以下配置：\n" +
                        "1. Redis服务是否已启动\n" +
                        "2. spring.data.redis.host 和 spring.data.redis.port 是否正确\n" +
                        "3. 网络连接是否正常";
                log.error(errorMsg);
                throw new RuntimeException(errorMsg);
            }
        } catch (Exception e) {
            String errorMsg = String.format(
                    "Redis初始化失败: %s\n请检查：\n" +
                            "1. Redis配置是否正确 (host: %s, port: %d)\n" +
                            "2. Redis服务是否正常运行\n" +
                            "3. 如果不需要Redis，请设置 app.redis.enabled=false",
                    e.getMessage(), redisHost, redisPort
            );
            log.error(errorMsg);
            throw new RuntimeException(errorMsg, e);
        }
    }

    private CacheService createMemoryCacheService() {
        log.info("使用内存缓存");
        return new MemoryCacheServiceImpl();
    }


    private boolean hasRedisConfiguration() {
        return redisHost != null && !redisHost.isEmpty() &&
                redisPort > 0 && redisPort <= 65535;
    }


    private enum RedisMode {
        REDIS_ENABLED,
        REDIS_COMPATIBILITY,
        MEMORY_ONLY
    }
}