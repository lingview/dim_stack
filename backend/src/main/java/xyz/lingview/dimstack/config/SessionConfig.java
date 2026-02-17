package xyz.lingview.dimstack.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.data.redis.config.ConfigureRedisAction;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

@Configuration
@Slf4j
public class SessionConfig {

    @Value("${app.redis.enabled:#{null}}")
    private Boolean appRedisEnabled;

    @Value("${spring.data.redis.host:}")
    private String redisHost;

    @Value("${spring.data.redis.port:0}")
    private int redisPort;

    private boolean shouldUseRedisSession() {
        if (appRedisEnabled != null && appRedisEnabled) {
            log.debug("Session模式: app.redis.enabled=true");
            return true;
        }

        if (appRedisEnabled != null && !appRedisEnabled) {
            log.debug("Session模式: app.redis.enabled=false");
            return false;
        }

        boolean hasRedisConfig = redisHost != null && !redisHost.isEmpty() &&
                redisPort > 0 && redisPort <= 65535;
        log.debug("Session模式: 兼容模式检测 hasRedisConfig={}", hasRedisConfig);
        return hasRedisConfig;
    }

    @Configuration
    @ConditionalOnExpression(
            "#{${app.redis.enabled:null} == true || " +
                    "(${app.redis.enabled:null} == null && " +
                    "'${spring.data.redis.host:}'.length() > 0 && " +
                    "${spring.data.redis.port:0} > 0)}"
    )
    @EnableRedisHttpSession(
            maxInactiveIntervalInSeconds = 604800,
            redisNamespace = "dimstack:session"
    )
    public static class RedisSessionConfiguration {

        @Bean
        public ConfigureRedisAction configureRedisAction() {
            log.info("Redis Session 已启用");
            return ConfigureRedisAction.NO_OP;
        }
    }

    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName("SESSION");
        serializer.setUseHttpOnlyCookie(true);
        serializer.setSameSite("Lax");
        serializer.setCookiePath("/");
        serializer.setCookieMaxAge(604800);

        return serializer;
    }


    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatCustomizer() {
        return factory -> factory.addContextCustomizers(context ->
                context.setSessionTimeout(10080)
        );
    }
}