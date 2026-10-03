package xyz.lingview.dimstack.plugin;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.jdbc.autoconfigure.DataSourceProperties;
import xyz.lingview.dimstack.plugin.api.PluginDb;

import javax.sql.DataSource;
import java.util.regex.Pattern;

/**
 * @Author: lingview
 * @Date: 2026/10/02 20:09:53
 * @Description: 插件数据库访问实现
 * @Version: 1.0
 */
public class PluginDbImpl implements PluginDb, AutoCloseable {

    private static final Pattern TABLE_SUFFIX = Pattern.compile("[a-z0-9_]{1,40}");
    private static final int MAX_POOL_SIZE = 4;

    private final String prefix;
    private final HikariDataSource pool;
    private final DataSource audited;

    PluginDbImpl(String pluginId, DataSourceProperties properties, PluginSqlAuditor auditor) {
        this.prefix = "plugin_" + pluginId.toLowerCase().replace('-', '_') + "_";
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(properties.getUrl());
        config.setUsername(properties.getUsername());
        config.setPassword(properties.getPassword());
        if (properties.getDriverClassName() != null) {
            config.setDriverClassName(properties.getDriverClassName());
        }
        config.setPoolName("plugin-" + pluginId);
        config.setMaximumPoolSize(MAX_POOL_SIZE);
        config.setMinimumIdle(0);
        config.setConnectionTimeout(3000);
        this.pool = new HikariDataSource(config);
        this.audited = PluginSqlAuditProxy.wrap(pool, pluginId, auditor);
    }

    @Override
    public String table(String name) {
        if (name == null || !TABLE_SUFFIX.matcher(name).matches()) {
            throw new IllegalArgumentException("表名只允许小写字母/数字/下划线: " + name);
        }
        return prefix + name;
    }

    @Override
    public DataSource dataSource() {
        return audited;
    }

    @Override
    public void close() {
        pool.close();
    }
}
