package xyz.lingview.dimstack.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

@Component
@Slf4j
public class DatabaseCreator {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @PostConstruct
    public void ensureDatabaseExists() {
        try {
            String dbName = dbUrl.substring(dbUrl.lastIndexOf("/") + 1).split("\\?")[0];
            String baseUrl = dbUrl.substring(0, dbUrl.lastIndexOf("/"));

            try (Connection conn = DriverManager.getConnection(baseUrl, username, password);
                 Statement stmt = conn.createStatement()) {

                stmt.executeUpdate("CREATE DATABASE IF NOT EXISTS `" + dbName + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
//                System.out.println("已确保数据库存在：" + dbName);
                log.info("已确保数据库存在：{}", dbName);

            }
        } catch (SQLException e) {
//            System.err.println("数据库创建失败：" + e.getMessage());
            log.error("数据库创建失败", e);
        }
    }
}
