package xyz.lingview.dimstack.init;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.core.env.Environment;

import java.net.Inet4Address;
import java.net.UnknownHostException;

@Configuration
@EnableAutoConfiguration
@ComponentScan(basePackages = "xyz.lingview.dimstack.init")
public class InitApplication {

    @Bean
    public ServerInfoPrinter serverInfoPrinter(Environment environment) {
        return new ServerInfoPrinter(environment);
    }

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

                String appMode = event.getApplicationContext().getEnvironment().getProperty("app.mode");
                boolean isInitMode = "init".equals(appMode);

                if (isInitMode) {
                    String hostAddress = null;
                    try {
                        hostAddress = Inet4Address.getLocalHost().getHostAddress();
                    } catch (UnknownHostException e) {
                        e.printStackTrace();
                    }

                    String localHost = hostAddress + ":" + getPort();
                    String url = "http://" + localHost + "/init/setup";
                    System.out.println("初始化地址为：" + url);
                }
            }
        }
    }
}