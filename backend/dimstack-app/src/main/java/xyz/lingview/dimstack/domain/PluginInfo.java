package xyz.lingview.dimstack.domain;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * @Author: lingview
 * @Date: 2026/08/03 20:23:41
 * @Description: 插件注册信息
 * @Version: 1.0
 */
@Data
public class PluginInfo {
    private Integer id;

    private String name;

    private String version;

    private String display_name;
    private String description;
    private String author;

    private String requires;

    private String jar_file;

    private Boolean enabled;
    private String setting_name;
    private String config_map_name;
    private LocalDateTime create_time;
    private LocalDateTime update_time;

    private String state;

    private String last_error;
}
