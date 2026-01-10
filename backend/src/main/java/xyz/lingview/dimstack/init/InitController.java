package xyz.lingview.dimstack.init;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import xyz.lingview.dimstack.config.ConfigInfo;
import xyz.lingview.dimstack.util.PasswordUtil;

import java.io.*;
import java.nio.file.Files;
import java.sql.*;

/**
 * @Author: lingview
 * @Date: 2026/01/10 19:15:59
 * @Description: 初始化控制器
 * @Version: 1.0
 */
@Controller
@RequestMapping("/init")
@ConditionalOnProperty(name = "app.mode", havingValue = "init")
public class InitController {

    @GetMapping("/setup")
    public String initSetup(Model model) {
        model.addAttribute("hasAdvanced", false);
        return "init/setup";
    }

    @PostMapping("/generate-config")
    public String generateConfig(
            @RequestParam String adminUsername,
            @RequestParam String adminPassword,
            @RequestParam Integer serverPort,
            @RequestParam String mysqlHost,
            @RequestParam Integer mysqlPort,
            @RequestParam String mysqlDatabase,
            @RequestParam String mysqlUser,
            @RequestParam String mysqlPassword,
            @RequestParam String redisHost,
            @RequestParam Integer redisPort,
            @RequestParam String redisPassword,
            @RequestParam Integer redisDatabase,
            @RequestParam(defaultValue = "false") boolean hasAdvanced,
            @RequestParam(required = false) String logLevel,
            @RequestParam(required = false) String dataRoot,
            @RequestParam(required = false) String uploadDir,
            @RequestParam(required = false) String logRoot,
            Model model) {

        try {
            // 生成配置文件
            generateApplicationYml(adminUsername, adminPassword, serverPort,
                    mysqlHost, mysqlPort, mysqlDatabase, mysqlUser, mysqlPassword,
                    redisHost, redisPort, redisPassword, redisDatabase,
                    hasAdvanced, logLevel, dataRoot, uploadDir, logRoot);

            // 初始化数据库
            initializeDatabase(mysqlHost, mysqlPort, mysqlDatabase, mysqlUser, mysqlPassword,
                             adminUsername, adminPassword);

            model.addAttribute("success", true);
            model.addAttribute("message", "配置文件生成成功！数据库初始化完成！请重启应用。");
        } catch (Exception e) {
            model.addAttribute("error", true);
            model.addAttribute("message", "初始化失败: " + e.getMessage());
        }

        return "init/result";
    }

    // 初始化数据库
    private void initializeDatabase(String mysqlHost, Integer mysqlPort, String mysqlDatabase,
                                  String mysqlUser, String mysqlPassword,
                                  String adminUsername, String adminPassword) throws SQLException, IOException {

        String jdbcUrl = String.format("jdbc:mysql://%s:%d/?characterEncoding=utf-8&nullCatalogMeansCurrent=true&serverTimezone=GMT%%2B8&useSSL=false&allowPublicKeyRetrieval=true",
                                     mysqlHost, mysqlPort);

        try (Connection connection = DriverManager.getConnection(jdbcUrl, mysqlUser, mysqlPassword)) {

            dropDatabaseIfExists(connection, mysqlDatabase);

            createDatabase(connection, mysqlDatabase);

            String targetDbUrl = String.format("jdbc:mysql://%s:%d/%s?characterEncoding=utf-8&nullCatalogMeansCurrent=true&serverTimezone=GMT%%2B8&useSSL=false&allowPublicKeyRetrieval=true",
                                             mysqlHost, mysqlPort, mysqlDatabase);

            try (Connection dbConnection = DriverManager.getConnection(targetDbUrl, mysqlUser, mysqlPassword)) {

                importSqlFile(dbConnection, adminUsername, adminPassword);
            }
        }
    }

    /**
     * 删除数据库
     */
    private void dropDatabaseIfExists(Connection connection, String dbName) throws SQLException {
        try (Statement stmt = connection.createStatement()) {
            stmt.executeUpdate("DROP DATABASE IF EXISTS `" + dbName + "`");
        }
    }

    /**
     * 创建数据库
     */
    private void createDatabase(Connection connection, String dbName) throws SQLException {
        try (Statement stmt = connection.createStatement()) {
            stmt.executeUpdate("CREATE DATABASE `" + dbName + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci");
        }
    }

    private void importSqlFile(Connection connection, String newAdminUsername, String newAdminPassword) throws SQLException, IOException {
        try {
            org.springframework.core.io.ClassPathResource resource =
                    new org.springframework.core.io.ClassPathResource("init.sql");
            org.springframework.jdbc.datasource.init.ScriptUtils.executeSqlScript(connection, resource);

            updateAdminUser(connection, newAdminUsername, newAdminPassword);
        } catch (Exception e) {
            throw new IOException("执行SQL脚本失败: " + e.getMessage(), e);
        }
    }


    private void updateAdminUser(Connection connection, String newAdminUsername, String newAdminPassword) throws SQLException {
        String hashedPassword = PasswordUtil.hashPassword(newAdminPassword);

        String updateSql = "UPDATE user_information SET username = ?, password = ? WHERE role_id = 4";

        try (PreparedStatement pstmt = connection.prepareStatement(updateSql)) {
            pstmt.setString(1, newAdminUsername);
            pstmt.setString(2, hashedPassword);

            int affectedRows = pstmt.executeUpdate();
            System.out.println("更新了 " + affectedRows + " 条管理员用户记录");
        }
    }


    private void generateApplicationYml(String adminUsername, String adminPassword, Integer serverPort,
                                        String mysqlHost, Integer mysqlPort, String mysqlDatabase,
                                        String mysqlUser, String mysqlPassword,
                                        String redisHost, Integer redisPort, String redisPassword,
                                        Integer redisDatabase, boolean hasAdvanced,
                                        String logLevel, String dataRoot, String uploadDir, String logRoot) throws IOException {

        StringBuilder ymlContent = new StringBuilder();

        // 基础配置
        ymlContent.append("# Generated by DimStack Initialization Wizard\n");
        ymlContent.append("\n");

        // Spring配置
        ymlContent.append("spring:\n");
        ymlContent.append("  jackson:\n");
        ymlContent.append("    time-zone: GMT+8\n");
        ymlContent.append("    date-format: yyyy-MM-dd HH:mm:ss\n");
        ymlContent.append("\n");

        ymlContent.append("  session:\n");
        ymlContent.append("    redis:\n");
        ymlContent.append("      namespace: \"dimstack:session\"\n");
        ymlContent.append("      flush-mode: on_save\n");
        ymlContent.append("      save-mode: always\n");
        ymlContent.append("\n");

        // MySQL配置
        ymlContent.append("  datasource:\n");
        ymlContent.append("    driver-class-name: com.mysql.cj.jdbc.Driver\n");
        ymlContent.append("    url: jdbc:mysql://").append(mysqlHost).append(":").append(mysqlPort)
                .append("/").append(mysqlDatabase).append("?characterEncoding=utf-8&nullCatalogMeansCurrent=true&serverTimezone=GMT%2B8&useSSL=false&allowPublicKeyRetrieval=true&useAffectedRows=true\n");
        ymlContent.append("    username: ").append(mysqlUser).append("\n");
        ymlContent.append("    password: \"").append(mysqlPassword).append("\"\n");
        ymlContent.append("    type: com.alibaba.druid.pool.DruidDataSource\n");
        ymlContent.append("\n");
        ymlContent.append("    druid:\n");
        ymlContent.append("      initial-size: 3\n");
        ymlContent.append("      min-idle: 3\n");
        ymlContent.append("      max-active: 20\n");
        ymlContent.append("      max-wait: 60000\n");
        ymlContent.append("      validation-query: SELECT 1\n");
        ymlContent.append("      test-while-idle: true\n");
        ymlContent.append("      test-on-borrow: false\n");
        ymlContent.append("      test-on-return: false\n");
        ymlContent.append("\n");

        // Servlet配置
        ymlContent.append("  servlet:\n");
        ymlContent.append("    multipart:\n");
        ymlContent.append("      enabled: true\n");
        ymlContent.append("      max-file-size: 100MB\n");
        ymlContent.append("      max-request-size: 100MB\n");
        ymlContent.append("\n");

        // Redis配置
        ymlContent.append("  data:\n");
        ymlContent.append("    redis:\n");
        ymlContent.append("      host: ").append(redisHost).append("\n");
        ymlContent.append("      port: ").append(redisPort).append("\n");
        ymlContent.append("      password: \"").append(redisPassword).append("\"\n");
        ymlContent.append("      database: ").append(redisDatabase).append("\n");
        ymlContent.append("      timeout: 5s\n");
        ymlContent.append("      lettuce:\n");
        ymlContent.append("        pool:\n");
        ymlContent.append("          max-active: 8\n");
        ymlContent.append("          max-idle: 8\n");
        ymlContent.append("          min-idle: 0\n");
        ymlContent.append("          max-wait: -1ms\n");
        ymlContent.append("\n");

        // DevTools配置
        ymlContent.append("  devtools:\n");
        ymlContent.append("    restart:\n");
        ymlContent.append("      enabled: false\n");
        ymlContent.append("    livereload:\n");
        ymlContent.append("      enabled: false\n");
        ymlContent.append("\n");

        // Thymeleaf配置
        ymlContent.append("  thymeleaf:\n");
        ymlContent.append("    cache: true\n");
        ymlContent.append("    enabled: true\n");
        ymlContent.append("    prefix: classpath:/templates/\n");
        ymlContent.append("    suffix: .html\n");
        ymlContent.append("    encoding: UTF-8\n");
        ymlContent.append("    servlet:\n");
        ymlContent.append("      content-type: text/html\n");
        ymlContent.append("\n");

        // SpringDoc配置
        ymlContent.append("springdoc:\n");
        ymlContent.append("  api-docs:\n");
        ymlContent.append("    enabled: true\n");
        ymlContent.append("    path: /v3/api-docs\n");
        ymlContent.append("  swagger-ui:\n");
        ymlContent.append("    enabled: true\n");
        ymlContent.append("    path: /swagger-ui/index.html\n");
        ymlContent.append("    cors:\n");
        ymlContent.append("      enabled: true\n");
        ymlContent.append("\n");

        // Project配置
        ymlContent.append("project:\n");
        ymlContent.append("  version: ${project.version}\n");
        ymlContent.append("  build-date: ${maven.build.timestamp}\n");
        ymlContent.append("\n");

        // Management配置
        ymlContent.append("management:\n");
        ymlContent.append("  endpoints:\n");
        ymlContent.append("    enabled-by-default: false\n");
        ymlContent.append("    web:\n");
        ymlContent.append("      exposure:\n");
        ymlContent.append("        include: health,info\n");
        ymlContent.append("  endpoint:\n");
        ymlContent.append("    health:\n");
        ymlContent.append("      enabled: true\n");
        ymlContent.append("      show-details: always\n");
        ymlContent.append("    info:\n");
        ymlContent.append("      enabled: true\n");
        ymlContent.append("    metrics:\n");
        ymlContent.append("      enabled: false\n");
        ymlContent.append("    shutdown:\n");
        ymlContent.append("      enabled: false\n");
        ymlContent.append("\n");

        // MyBatis配置
        ymlContent.append("mybatis:\n");
        ymlContent.append("  type-aliases-package: xyz.lingview.dimstack.**.domain\n");
        ymlContent.append("  mapper-locations: classpath*:mapper/*Mapper.xml\n");
        ymlContent.append("  config-location: classpath:mybatis-config.xml\n");
        ymlContent.append("\n");

        // Server配置 - 使用用户自定义端口
        ymlContent.append("server:\n");
        ymlContent.append("  port: ").append(serverPort).append("\n");
        ymlContent.append("  servlet:\n");
        ymlContent.append("    context-path: /\n");
        ymlContent.append("  tomcat:\n");
        ymlContent.append("    uri-encoding: UTF-8\n");
        ymlContent.append("    max-threads: 200\n");
        ymlContent.append("    min-spare-threads: 10\n");
        ymlContent.append("    protocol-header: X-Forwarded-Proto\n");
        ymlContent.append("    remote-ip-header: X-Forwarded-For\n");
        ymlContent.append("\n");
        ymlContent.append("  forward-headers-strategy: native\n");
        ymlContent.append("\n");

        // Logging配置
        if (hasAdvanced && logLevel != null && !logLevel.trim().isEmpty()) {
            ymlContent.append("logging:\n");
            ymlContent.append("  level:\n");
            ymlContent.append("    xyz.lingview.dimstack: ").append(logLevel).append("\n");
            ymlContent.append("    org.springframework: warn\n");
            ymlContent.append("    org.springframework.security: info\n");
            ymlContent.append("    org.springframework.session: info\n");
            ymlContent.append("    org.springframework.web: info\n");
            ymlContent.append("\n");
        } else {
            // 默认日志级别
            ymlContent.append("logging:\n");
            ymlContent.append("  level:\n");
            ymlContent.append("    xyz.lingview.dimstack: info\n");
            ymlContent.append("    org.springframework: warn\n");
            ymlContent.append("    org.springframework.security: info\n");
            ymlContent.append("    org.springframework.session: info\n");
            ymlContent.append("    org.springframework.web: info\n");
            ymlContent.append("\n");
        }

        // File配置
        if (hasAdvanced) {
            ymlContent.append("file:\n");
            ymlContent.append("  # 文件存储目录\n");
            ymlContent.append("  data-root: ").append(dataRoot != null ? dataRoot : ".").append("\n");
            ymlContent.append("  upload-dir: ").append(uploadDir != null ? uploadDir : "upload").append("\n");
            ymlContent.append("  # 日志存储目录\n");
            ymlContent.append("  log-root: ").append(logRoot != null ? logRoot : ".").append("\n");
            ymlContent.append("\n");
        } else {
            // 默认文件配置
            ymlContent.append("file:\n");
            ymlContent.append("  # 文件存储目录\n");
            ymlContent.append("  data-root: .\n");
            ymlContent.append("  upload-dir: upload\n");
            ymlContent.append("  # 日志存储目录\n");
            ymlContent.append("  log-root: .\n");
            ymlContent.append("\n");
        }

        // App配置
        ymlContent.append("app:\n");
        ymlContent.append("  theme:\n");
        ymlContent.append("    active-theme: default\n");
        ymlContent.append("    themes-path: themes\n");

        // 写入文件
        if (!Files.exists(ConfigInfo.CONFIG_DIR)) {
            Files.createDirectories(ConfigInfo.CONFIG_DIR);
        }

        try (FileWriter writer = new FileWriter(ConfigInfo.MAIN_CONFIG_FILE.toString())) {
            writer.write(ymlContent.toString());
        }
    }
}
