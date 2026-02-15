package xyz.lingview.dimstack.init;

import org.flywaydb.core.Flyway;
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
import java.nio.charset.StandardCharsets;
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
            @RequestParam(defaultValue = "false") boolean enableRedis,
            @RequestParam(required = false) String redisHost,
            @RequestParam(required = false) Integer redisPort,
            @RequestParam(required = false) String redisPassword,
            @RequestParam(required = false) Integer redisDatabase,
            @RequestParam(defaultValue = "false") boolean hasAdvanced,
            @RequestParam(required = false) String logLevel,
            @RequestParam(required = false) String dataRoot,
            @RequestParam(required = false) String uploadDir,
            @RequestParam(required = false) String logRoot,
            @RequestParam(defaultValue = "false") boolean onlyGenerateConfig,
            Model model) {

        try {
            // 生成配置文件
            generateApplicationYml(adminUsername, adminPassword, serverPort,
                    mysqlHost, mysqlPort, mysqlDatabase, mysqlUser, mysqlPassword,
                    enableRedis, redisHost, redisPort, redisPassword, redisDatabase,
                    hasAdvanced, logLevel, dataRoot, uploadDir, logRoot);

            if (!onlyGenerateConfig) {
                // 初始化数据库
                initializeDatabase(mysqlHost, mysqlPort, mysqlDatabase, mysqlUser, mysqlPassword,
                        adminUsername, adminPassword);

                String latestVersion = readLatestFlywayVersion();
                baselineFlyway(mysqlHost, mysqlPort, mysqlDatabase, mysqlUser, mysqlPassword, latestVersion);
                model.addAttribute("success", true);
                model.addAttribute("message", "配置文件生成成功！数据库初始化完成！请重启应用。");
            } else {
                // 仅生成配置文件
                String latestVersion = readLatestFlywayVersion();

                if (!checkFlywaySchemaHistoryExists(mysqlHost, mysqlPort, mysqlDatabase, mysqlUser, mysqlPassword)) {
                    baselineFlyway(mysqlHost, mysqlPort, mysqlDatabase, mysqlUser, mysqlPassword, latestVersion);
                    model.addAttribute("message", "配置文件已重新生成！由于数据库中没有flyway历史记录，已执行基线设置。请重启应用以使新配置生效。");
                } else {
                    model.addAttribute("message", "配置文件已重新生成！数据库中已有flyway历史记录，未执行基线设置。请重启应用以使新配置生效。");
                }
                model.addAttribute("success", true);
            }
        } catch (Exception e) {
            model.addAttribute("success", false);
            model.addAttribute("message", "初始化失败: " + e.getMessage());
        }

        return "init/result";
    }

    private boolean checkFlywaySchemaHistoryExists(String mysqlHost, Integer mysqlPort, String mysqlDatabase,
                                                   String mysqlUser, String mysqlPassword) throws SQLException {
        String jdbcUrl = "jdbc:mysql://%s:%d/%s?characterEncoding=utf-8&nullCatalogMeansCurrent=true&serverTimezone=GMT%%2B8&useSSL=false&allowPublicKeyRetrieval=true".formatted(
                mysqlHost, mysqlPort, mysqlDatabase);

        try (Connection connection = DriverManager.getConnection(jdbcUrl, mysqlUser, mysqlPassword)) {
            try (Statement stmt = connection.createStatement()) {
                String sql = "SELECT COUNT(*) FROM information_schema.tables " +
                             "WHERE table_schema = '" + mysqlDatabase + "' " +
                             "AND table_name = 'flyway_schema_history'";
                
                try (ResultSet rs = stmt.executeQuery(sql)) {
                    if (rs.next()) {
                        int count = rs.getInt(1);
                        return count > 0;
                    }
                }
            }
        }
        return false;
    }

    // 初始化数据库
    private void initializeDatabase(String mysqlHost, Integer mysqlPort, String mysqlDatabase,
                                  String mysqlUser, String mysqlPassword,
                                  String adminUsername, String adminPassword) throws SQLException, IOException {

        String jdbcUrl = "jdbc:mysql://%s:%d/?characterEncoding=utf-8&nullCatalogMeansCurrent=true&serverTimezone=GMT%%2B8&useSSL=false&allowPublicKeyRetrieval=true".formatted(
                mysqlHost, mysqlPort);

        try (Connection connection = DriverManager.getConnection(jdbcUrl, mysqlUser, mysqlPassword)) {

            dropDatabaseIfExists(connection, mysqlDatabase);

            createDatabase(connection, mysqlDatabase);

            String targetDbUrl = "jdbc:mysql://%s:%d/%s?characterEncoding=utf-8&nullCatalogMeansCurrent=true&serverTimezone=GMT%%2B8&useSSL=false&allowPublicKeyRetrieval=true".formatted(
                    mysqlHost, mysqlPort, mysqlDatabase);

            try (Connection dbConnection = DriverManager.getConnection(targetDbUrl, mysqlUser, mysqlPassword)) {

                importSqlFile(dbConnection, adminUsername, adminPassword);
            }
        }
    }

    private String readLatestFlywayVersion() throws IOException {
        org.springframework.core.io.Resource resource =
                new org.springframework.core.io.ClassPathResource("db/migration/database_version.txt");

        if (!resource.exists()) {
            throw new IllegalStateException("未找到 db/migration/database_version.txt，请确保该文件存在！");
        }

        try (InputStream is = resource.getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String version = reader.readLine();
            if (version == null || version.trim().isEmpty()) {
                throw new IllegalStateException("version.txt 为空！");
            }
            return version.trim();
        }
    }

    private void baselineFlyway(String mysqlHost, Integer mysqlPort, String mysqlDatabase,
                                String mysqlUser, String mysqlPassword, String latestVersion) throws Exception {

        String jdbcUrl = "jdbc:mysql://%s:%d/%s?characterEncoding=utf-8&nullCatalogMeansCurrent=true&serverTimezone=GMT%%2B8&useSSL=false&allowPublicKeyRetrieval=true".formatted(
                mysqlHost, mysqlPort, mysqlDatabase
        );

        Flyway flyway = Flyway.configure()
                .dataSource(jdbcUrl, mysqlUser, mysqlPassword)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .baselineVersion(latestVersion)
                .load();

        flyway.baseline();

        System.out.println("Flyway baseline 成功，版本: " + latestVersion);
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
            stmt.executeUpdate("CREATE DATABASE `" + dbName + "` CHARACTER SET utf8mb4");
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
                                        boolean enableRedis, String redisHost, Integer redisPort, String redisPassword,
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

        // MySQL配置
        ymlContent.append("  datasource:\n");
        ymlContent.append("    driver-class-name: com.mysql.cj.jdbc.Driver\n");
        ymlContent.append("    url: jdbc:mysql://").append(mysqlHost).append(":").append(mysqlPort)
                .append("/").append(mysqlDatabase).append("?characterEncoding=utf-8&nullCatalogMeansCurrent=true&serverTimezone=GMT%2B8&useSSL=false&allowPublicKeyRetrieval=true&useAffectedRows=true\n");
        ymlContent.append("    username: ").append(mysqlUser).append("\n");
        ymlContent.append("    password: \"").append(mysqlPassword).append("\"\n");
        ymlContent.append("    hikari:\n");
        ymlContent.append("      maximum-pool-size: 20\n");
        ymlContent.append("      minimum-idle: 5\n");
        ymlContent.append("      connection-timeout: 30000\n");
        ymlContent.append("      idle-timeout: 600000\n");
        ymlContent.append("      max-lifetime: 1800000\n");
        ymlContent.append("\n");

        // Servlet配置
        ymlContent.append("  servlet:\n");
        ymlContent.append("    multipart:\n");
        ymlContent.append("      enabled: true\n");
        ymlContent.append("      max-file-size: 100MB\n");
        ymlContent.append("      max-request-size: 100MB\n");
        ymlContent.append("\n");

        // Redis配置
        if (enableRedis && redisHost != null && redisPort != null) {
            ymlContent.append("  data:\n");
            ymlContent.append("    redis:\n");
            ymlContent.append("      host: ").append(redisHost).append("\n");
            ymlContent.append("      port: ").append(redisPort).append("\n");
            if (redisPassword != null && !redisPassword.isEmpty()) {
                ymlContent.append("      password: \"").append(redisPassword).append("\"\n");
            }
            ymlContent.append("      database: ").append(redisDatabase != null ? redisDatabase : 0).append("\n");
            ymlContent.append("      timeout: 5s\n");
            ymlContent.append("      lettuce:\n");
            ymlContent.append("        pool:\n");
            ymlContent.append("          max-active: 8\n");
            ymlContent.append("          max-idle: 8\n");
            ymlContent.append("          min-idle: 0\n");
            ymlContent.append("          max-wait: -1ms\n");
            ymlContent.append("\n");
        }

        // Thymeleaf配置
        ymlContent.append("  thymeleaf:\n");
        ymlContent.append("    cache: true\n");
        ymlContent.append("    prefix: classpath:/templates/\n");
        ymlContent.append("    suffix: .html\n");
        ymlContent.append("    encoding: UTF-8\n");
        ymlContent.append("    servlet:\n");
        ymlContent.append("      content-type: text/html\n");
        ymlContent.append("\n");

        // Management配置
        ymlContent.append("management:\n");
        ymlContent.append("  endpoints:\n");
        ymlContent.append("    access.default: none\n");
        ymlContent.append("    web:\n");
        ymlContent.append("      exposure:\n");
        ymlContent.append("        include: health,info\n");
        ymlContent.append("  endpoint:\n");
        ymlContent.append("    health:\n");
        ymlContent.append("      access: read-only\n");
        ymlContent.append("      show-details: always\n");
        if (!enableRedis) {
            ymlContent.append("    redis:\n");
            ymlContent.append("      enabled: false\n");
        }
        ymlContent.append("    info:\n");
        ymlContent.append("      access: read-only\n");
        ymlContent.append("    metrics:\n");
        ymlContent.append("      access: none\n");
        ymlContent.append("    shutdown:\n");
        ymlContent.append("      access: none\n");
        ymlContent.append("\n");

        // MyBatis配置
        ymlContent.append("mybatis:\n");
        ymlContent.append("  type-aliases-package: xyz.lingview.dimstack.**.domain\n");
        ymlContent.append("  mapper-locations: classpath*:mapper/*Mapper.xml\n");
        ymlContent.append("  config-location: classpath:mybatis-config.xml\n");
        ymlContent.append("\n");

        // Server配置
        ymlContent.append("server:\n");
        ymlContent.append("  port: ").append(serverPort).append("\n");
        ymlContent.append("  servlet:\n");
        ymlContent.append("    context-path: /\n");
        ymlContent.append("  tomcat:\n");
        ymlContent.append("    uri-encoding: UTF-8\n");
        ymlContent.append("    threads.max: 200\n");
        ymlContent.append("    threads.min-spare: 10\n");
        ymlContent.append("    remoteip.protocol-header: X-Forwarded-Proto\n");
        ymlContent.append("    remoteip.remote-ip-header: X-Forwarded-For\n");
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
        ymlContent.append("  redis:\n");
        ymlContent.append("    enabled: ").append(enableRedis).append("\n");
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
