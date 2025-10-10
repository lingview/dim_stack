package xyz.lingview.systemconfig;

import xyz.lingview.systemconfig.util.PasswordUtil;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Scanner;

public class Main {
    private static final String CONFIG_DIR = "config";
    private static final String APP_CONFIG_FILE = CONFIG_DIR + "/application.yml";
    private static final String ADMIN_CONFIG_FILE = CONFIG_DIR + "/admin.ini";

    public static void main(String[] args) {
        File configDir = new File(CONFIG_DIR);
        if (configDir.exists() && configDir.isDirectory()) {
            System.out.println("检测到已存在 config 目录，请先删除后再运行此程序");
            return;
        }

        Scanner scanner = new Scanner(System.in);

        System.out.print("请输入MySQL主机地址 (默认: localhost): ");
        String dbHost = scanner.nextLine().trim();
        if (dbHost.isEmpty()) {
            dbHost = "localhost";
        }

        System.out.print("请输入MySQL端口 (默认: 3306): ");
        String dbPort = scanner.nextLine().trim();
        if (dbPort.isEmpty()) {
            dbPort = "3306";
        }

        System.out.print("请输入数据库名称 (默认: dim_stack): ");
        String dbName = scanner.nextLine().trim();
        if (dbName.isEmpty()) {
            dbName = "dim_stack";
        }

        System.out.print("请输入数据库用户名 (默认: root): ");
        String dbUsername = scanner.nextLine().trim();
        if (dbUsername.isEmpty()) {
            dbUsername = "root";
        }

        System.out.print("请输入数据库密码: ");
        String dbPassword = scanner.nextLine().trim();

        System.out.print("请输入系统管理员用户名 (默认: admin): ");
        String adminUsername = scanner.nextLine().trim();
        if (adminUsername.isEmpty()) {
            adminUsername = "admin";
        }

        System.out.print("请输入系统管理员密码: ");
        String adminPassword = scanner.nextLine().trim();
        String encryptedAdminPassword = PasswordUtil.hashPassword(adminPassword);

        System.out.print("请输入Redis主机地址 (默认: 127.0.0.1): ");
        String redisHost = scanner.nextLine().trim();
        if (redisHost.isEmpty()) {
            redisHost = "127.0.0.1";
        }

        System.out.print("请输入Redis端口 (默认: 6379): ");
        String redisPort = scanner.nextLine().trim();
        if (redisPort.isEmpty()) {
            redisPort = "6379";
        }

        System.out.print("请输入Redis用户名 (可选): ");
        String redisUsername = scanner.nextLine().trim();

        System.out.print("请输入Redis密码 (可选): ");
        String redisPassword = scanner.nextLine().trim();

        if (!configDir.exists()) {
            configDir.mkdirs();
        }

        // 生成配置文件
        generateAppConfigFile(dbHost, dbPort, dbName, dbUsername, dbPassword,
                redisHost, redisPort, redisUsername, redisPassword);
        generateAdminConfigFile(adminUsername, encryptedAdminPassword);

        scanner.close();
    }

    private static void generateAppConfigFile(String dbHost, String dbPort, String dbName,
                                              String dbUsername, String dbPassword,
                                              String redisHost, String redisPort,
                                              String redisUsername, String redisPassword) {
        String configContent = generateAppConfigContent(dbHost, dbPort, dbName, dbUsername, dbPassword,
                redisHost, redisPort, redisUsername, redisPassword);

        try (FileWriter writer = new FileWriter(APP_CONFIG_FILE)) {
            writer.write(configContent);
            System.out.println("应用配置文件已成功生成为 " + APP_CONFIG_FILE);
        } catch (IOException e) {
            System.err.println("生成应用配置文件时出错: " + e.getMessage());
        }
    }

    private static void generateAdminConfigFile(String adminUsername, String encryptedAdminPassword) {
        String configContent = "username=" + adminUsername + "\n" +
                "password=" + encryptedAdminPassword + "\n";

        try (FileWriter writer = new FileWriter(ADMIN_CONFIG_FILE)) {
            writer.write(configContent);
            System.out.println("管理员配置文件已成功生成为 " + ADMIN_CONFIG_FILE);
        } catch (IOException e) {
            System.err.println("生成管理员配置文件时出错: " + e.getMessage());
        }
    }

    private static String generateAppConfigContent(String dbHost, String dbPort, String dbName,
                                                   String dbUsername, String dbPassword,
                                                   String redisHost, String redisPort,
                                                   String redisUsername, String redisPassword) {
        StringBuilder sb = new StringBuilder();
        sb.append("spring:\n");
        sb.append("  jackson:\n");
        sb.append("    time-zone: GMT+8\n");
        sb.append("    date-format: yyyy-MM-dd HH:mm:ss\n");
        sb.append("\n");
        sb.append("  session:\n");
        sb.append("    redis:\n");
        sb.append("      namespace: \"dimstack:session\"\n");
        sb.append("      flush-mode: on_save\n");
        sb.append("      save-mode: always\n");
        sb.append("\n");
        sb.append("  datasource:\n");
        sb.append("    driver-class-name: com.mysql.cj.jdbc.Driver\n");
        sb.append("    url: jdbc:mysql://").append(dbHost).append(":").append(dbPort)
                .append("/").append(dbName)
                .append("?characterEncoding=utf-8&nullCatalogMeansCurrent=true&serverTimezone=GMT%2B8&useSSL=false&allowPublicKeyRetrieval=true&useAffectedRows=true\n");
        sb.append("    username: ").append(dbUsername).append("\n");
        sb.append("    password: \"").append(dbPassword).append("\"\n");
        sb.append("    type: com.alibaba.druid.pool.DruidDataSource\n");
        sb.append("\n");
        sb.append("    druid:\n");
        sb.append("      initial-size: 3\n");
        sb.append("      min-idle: 3\n");
        sb.append("      max-active: 20\n");
        sb.append("      max-wait: 60000\n");
        sb.append("      validation-query: SELECT 1\n");
        sb.append("      test-while-idle: true\n");
        sb.append("      test-on-borrow: false\n");
        sb.append("      test-on-return: false\n");
        sb.append("\n");
        sb.append("\n");
        sb.append("  servlet:\n");
        sb.append("    multipart:\n");
        sb.append("      enabled: true\n");
        sb.append("      max-file-size: 1000000MB\n");
        sb.append("      max-request-size: 200000MB\n");
        sb.append("\n");
        sb.append("  data:\n");
        sb.append("    redis:\n");
        sb.append("      host: ").append(redisHost).append("\n");
        sb.append("      port: ").append(redisPort).append("\n");

        if (!redisUsername.isEmpty()) {
            sb.append("      username: ").append(redisUsername).append("\n");
        }
        if (!redisPassword.isEmpty()) {
            sb.append("      password: \"").append(redisPassword).append("\"\n");
        } else {
            sb.append("      password: \"\"\n");
        }

        sb.append("      timeout: 5s\n");
        sb.append("      lettuce:\n");
        sb.append("        pool:\n");
        sb.append("          max-active: 8\n");
        sb.append("          max-idle: 8\n");
        sb.append("          min-idle: 0\n");
        sb.append("          max-wait: -1ms\n");
        sb.append("\n");
        sb.append("  devtools:\n");
        sb.append("    restart:\n");
        sb.append("      enabled: false\n");
        sb.append("    livereload:\n");
        sb.append("      enabled: false\n");
        sb.append("\n");
        sb.append("\n");
        sb.append("  thymeleaf:\n");
        sb.append("    cache: true\n");
        sb.append("    enabled: true\n");
        sb.append("    prefix: classpath:/templates/\n");
        sb.append("    suffix: .html\n");
        sb.append("    encoding: UTF-8\n");
        sb.append("    servlet:\n");
        sb.append("      content-type: text/html\n");
        sb.append("\n");
        sb.append("  profiles:\n");
        sb.append("    active: dev\n");
        sb.append("\n");
        sb.append("springdoc:\n");
        sb.append("  api-docs:\n");
        sb.append("    enabled: false\n");
        sb.append("    path: /v3/api-docs\n");
        sb.append("  swagger-ui:\n");
        sb.append("    enabled: false\n");
        sb.append("    path: /swagger-ui/index.html\n");
        sb.append("    cors:\n");
        sb.append("      enabled: false\n");
        sb.append("\n");
        sb.append("project:\n");
        sb.append("  version: ${project.version}\n");
        sb.append("  build-date: ${maven.build.timestamp}\n");
        sb.append("\n");
        sb.append("management:\n");
        sb.append("  endpoints:\n");
        sb.append("    enabled-by-default: false\n");
        sb.append("    web:\n");
        sb.append("      exposure:\n");
        sb.append("        include: health,info\n");
        sb.append("  endpoint:\n");
        sb.append("    health:\n");
        sb.append("      enabled: true\n");
        sb.append("      show-details: when-authorized\n");
        sb.append("    info:\n");
        sb.append("      enabled: true\n");
        sb.append("    metrics:\n");
        sb.append("      enabled: false\n");
        sb.append("    shutdown:\n");
        sb.append("      enabled: false\n");
        sb.append("\n");
        sb.append("mybatis:\n");
        sb.append("  type-aliases-package: xyz.lingview.dimstack.**.domain\n");
        sb.append("  mapper-locations: classpath*:mapper/*Mapper.xml\n");
        sb.append("  config-location: classpath:mybatis-config.xml\n");
        sb.append("\n");
        sb.append("server:\n");
        sb.append("  port: 2222\n");
        sb.append("  servlet:\n");
        sb.append("    context-path: /\n");
        sb.append("  tomcat:\n");
        sb.append("    uri-encoding: UTF-8\n");
        sb.append("    max-threads: 200\n");
        sb.append("    min-spare-threads: 10\n");
        sb.append("    protocol-header: X-Forwarded-Proto\n");
        sb.append("    remote-ip-header: X-Forwarded-For\n");
        sb.append("\n");
        sb.append("  forward-headers-strategy: native\n");
        sb.append("\n");
        sb.append("logging:\n");
        sb.append("  level:\n");
        sb.append("    xyz.lingview.dimstack: debug\n");
        sb.append("    org.springframework: warn\n");
        sb.append("    org.springframework.security: info\n");
        sb.append("    org.springframework.session: debug\n");
        sb.append("    org.springframework.web: debug\n");
        sb.append("\n");
        sb.append("file:\n");
        sb.append("  upload-dir: upload\n");

        return sb.toString();
    }
}