package xyz.lingview.dimstack.plugin.api;

import javax.sql.DataSource;

/**
 * @Author: lingview
 * @Date: 2026/09/30 21:47:12
 * @Description: 插件数据库访问
 * @Version: 1.0
 */
public interface PluginDb {

    String table(String name);

    DataSource dataSource();
}
