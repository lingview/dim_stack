package xyz.lingview.dimstack_expansion_server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

@SpringBootApplication
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 604800, redisNamespace = "dimstack_expansion_server:session")
public class StartServer {
    public static void main(String[] args) {
        SpringApplication.run(StartServer.class, args);
    }
}