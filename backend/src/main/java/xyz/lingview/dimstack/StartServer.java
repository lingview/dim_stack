package xyz.lingview.dimstack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.stereotype.Component;

import java.awt.*;
import java.io.IOException;
import java.net.Inet4Address;
import java.net.UnknownHostException;

@SpringBootApplication
@EnableAsync
@EnableScheduling
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 604800, redisNamespace = "dimstack:session")
public class StartServer {
    public static void main(String[] args) {
        SpringApplication.run(StartServer.class, args);
    }
    @Component
    public static class BrowserLauncher implements ApplicationListener<ContextRefreshedEvent> {

        private final Environment environment;
        public BrowserLauncher(Environment environment) {
            this.environment = environment;
        }

        public String getPort() {
            return environment.getProperty("local.server.port");
        }

        private boolean launched = false;

        @Override
        public void onApplicationEvent(ContextRefreshedEvent event) {
            if (!launched && event.getApplicationContext().getParent() == null) {
                launched = true;

                boolean autoOpenBrowser = Boolean.parseBoolean(event.getApplicationContext().getEnvironment().getProperty("auto.open.browser", "true"));

                if (autoOpenBrowser) {
                    if (GraphicsEnvironment.isHeadless()) {
                        System.out.println("尝试通过命令行方式打开浏览器QAQ...");
                    }

                    String hostAddress = null;
                    try {
                        hostAddress = Inet4Address.getLocalHost().getHostAddress();
                    } catch (UnknownHostException e) {
                        e.printStackTrace();
                    }

                    String localHost = hostAddress + ":" + getPort();
                    String url = "http://" + localHost;
                    System.out.println("当前服务器地址为：" + url);

                    try {
                        openBrowserByCommand(url);
                    } catch (IOException e) {
                        e.printStackTrace();
                        System.err.println("无法通过命令行启动浏览器：" + e.getMessage());
                    }
                }
            }
        }

        private void openBrowserByCommand(String url) throws IOException {
            String osName = System.getProperty("os.name").toLowerCase();
            ProcessBuilder processBuilder = null;

            if (osName.contains("win")) {
//                processBuilder = new ProcessBuilder("cmd", "/c", "start", url);
            } else if (osName.contains("mac")) {
                processBuilder = new ProcessBuilder("open", url);
            } else {
//                processBuilder = new ProcessBuilder("xdg-open", url);
                System.out.println("当前为linux/unix系统运行请手动打开浏览器");
            }

            if (processBuilder != null) {
                processBuilder.inheritIO();
                Process process = processBuilder.start();
                try {
                    int exitCode = process.waitFor();
                    if (exitCode != 0) {
                        System.err.println("命令行启动浏览器失败，退出码：" + exitCode);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new IOException("命令行启动浏览器过程中被中断", e);
                }
            } else {
                System.out.println("未知的操作系统，无法启动浏览器");
            }
        }
    }
}