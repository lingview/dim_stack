package xyz.lingview.dimstack.plugin;

import lombok.Data;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 插件描述信息
 * @Version: 1.0
 */
@Data
public class PluginManifest {

    private String id;

    private String version;

    private String requires;

    private String displayName;

    private String description;

    private String author;

    private String settingName;

    private String configMapName;

    private String scanPackage;

    private String pluginClass;

    private List<String> publicApiPaths;

    private boolean enabled;
}
