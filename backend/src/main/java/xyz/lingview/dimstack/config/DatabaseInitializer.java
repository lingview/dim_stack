package xyz.lingview.dimstack.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;

@Component
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final DataSource dataSource;

    public DatabaseInitializer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            if (isDatabaseEmpty(conn)) {
//                System.out.println("检测到数据库为空，正在执行初始化 SQL...");
                log.info("检测到数据库为空，正在执行初始化 SQL...");
                ScriptUtils.executeSqlScript(conn, new ClassPathResource("init.sql"));
//                System.out.println("数据库初始化完成！");
                log.info("数据库初始化完成！");
            } else {
//                System.out.println("数据库已有数据，跳过初始化。");
                log.info("数据库已有数据，跳过初始化。");
            }
        } catch (Exception e) {
//            System.err.println("数据库初始化失败: " + e.getMessage());
//            e.printStackTrace();
            log.error("数据库初始化失败", e);

        }
    }

    private boolean isDatabaseEmpty(Connection conn) throws Exception {
        DatabaseMetaData metaData = conn.getMetaData();
        try (ResultSet rs = metaData.getTables(null, null, "%", new String[]{"TABLE"})) {
            return !rs.next();
        }
    }
}
