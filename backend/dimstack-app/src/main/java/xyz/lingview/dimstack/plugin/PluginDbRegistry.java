package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.pf4j.PluginRuntimeException;
import org.springframework.boot.jdbc.autoconfigure.DataSourceProperties;
import org.springframework.stereotype.Component;
import xyz.lingview.dimstack.plugin.api.PluginDb;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @Author: lingview
 * @Date: 2026/10/03 10:37:18
 * @Description: 插件数据库连接池注册表
 * @Version: 1.0
 */
@Slf4j
@Component
public class PluginDbRegistry {

    private final DataSourceProperties dataSourceProperties;
    private final PluginSqlAuditor auditor;
    private final Map<String, PluginDbImpl> instances = new ConcurrentHashMap<>();

    public PluginDbRegistry(DataSourceProperties dataSourceProperties, PluginSqlAuditor auditor) {
        this.dataSourceProperties = dataSourceProperties;
        this.auditor = auditor;
    }

    public PluginDb get(String pluginId) {
        return instances.computeIfAbsent(pluginId, id -> {
            PluginDbImpl db = new PluginDbImpl(id, dataSourceProperties, auditor);
            for (Map.Entry<String, PluginDbImpl> entry : instances.entrySet()) {
                // 归一化后前缀相同会共用表空间, 直接拒绝启动(如 Demo 与 demo, a.b 与 a-b)
                if (!entry.getKey().equals(id) && entry.getValue().tablePrefix().equals(db.tablePrefix())) {
                    db.close();
                    throw new PluginRuntimeException("插件表前缀冲突: " + id
                            + " 与 " + entry.getKey() + " 归一化后同为 " + db.tablePrefix());
                }
            }
            log.info("插件连接池已创建: {} (最大连接 {})", id, 4);
            return db;
        });
    }

    public void dispose(String pluginId) {
        PluginDbImpl db = instances.remove(pluginId);
        if (db != null) {
            db.close();
            log.info("插件连接池已释放: {}", pluginId);
        }
    }
}
