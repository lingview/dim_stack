package xyz.lingview.dimstack;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.stereotype.Component;
import xyz.lingview.dimstack.config.ConfigInfo;

import java.net.Inet4Address;
import java.net.UnknownHostException;

@Slf4j
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class StartServer {
    public static void main(String[] args) {
        if (needsInitialization()) {
            startInitMode(args);
        } else {
            SpringApplication.run(StartServer.class, args);
        }
    }

    private static boolean needsInitialization() {
        return !ConfigInfo.isConfigComplete();
    }

    private static void startInitMode(String[] args) {
        log.info("系统初始化模块加载成功");
        log.info("检测到首次运行或配置不完整，启动初始化模式...");
        log.info("配置文件目录: " + ConfigInfo.CONFIG_DIR.toAbsolutePath());

        SpringApplication initApp = new SpringApplication(xyz.lingview.dimstack.init.InitApplication.class);

        String[] initArgs = combineArguments(args, new String[]{
                "--spring.config.location=classpath:/",
                "--spring.config.name=application-init"
        });

        initApp.run(initArgs);
    }


    private static String[] combineArguments(String[] originalArgs, String[] additionalArgs) {
        String[] combined = new String[originalArgs.length + additionalArgs.length];
        System.arraycopy(originalArgs, 0, combined, 0, originalArgs.length);
        System.arraycopy(additionalArgs, 0, combined, originalArgs.length, additionalArgs.length);
        return combined;
    }


    @Component
    public static class ServerInfoPrinter implements ApplicationListener<ContextRefreshedEvent> {

        private final Environment environment;

        public ServerInfoPrinter(Environment environment) {
            this.environment = environment;
        }

        public String getPort() {
            return environment.getProperty("local.server.port");
        }

        private boolean printed = false;

        @Override
        public void onApplicationEvent(ContextRefreshedEvent event) {
            if (!printed && event.getApplicationContext().getParent() == null) {
                printed = true;

                // 检查是否是初始化模式
                String appMode = event.getApplicationContext().getEnvironment().getProperty("app.mode");
                boolean isInitMode = "init".equals(appMode);

                if (!isInitMode) {
                    String hostAddress = null;
                    try {
                        hostAddress = Inet4Address.getLocalHost().getHostAddress();
                    } catch (UnknownHostException e) {
                        log.warn("无法获取本机IP地址", e);
                        hostAddress = "localhost";
                    }

                    String localHost = hostAddress + ":" + getPort();
                    String url = "http://" + localHost;
                    log.info("当前服务器地址为：" + url);
                }
            }
        }
    }
}