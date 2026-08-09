package xyz.lingview.dimstack.domain;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * @Author: lingview
 * @Date: 2026/08/09 22:11:27
 * @Description: 插件配置记录
 * @Version: 1.0
 */
@Data
public class PluginConfig {
    private Integer id;
    private String plugin_name;
    private String config_key;
    private String config_value;
    private LocalDateTime update_time;
}
