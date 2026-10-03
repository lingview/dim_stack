package xyz.lingview.dimstack.domain;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * @Author: lingview
 * @Date: 2026/10/01 10:26:35
 * @Description: 插件SQL审计记录
 * @Version: 1.0
 */
@Data
public class PluginSqlAudit {
    private Long id;
    private String plugin_name;
    private String category;
    private String sql_text;
    private Long cost_millis;
    private LocalDateTime create_time;
}
