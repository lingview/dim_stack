package xyz.lingview.dimstack.plugin;

import lombok.Data;

/**
 * @Author: lingview
 * @Date: 2026/08/23 21:07:59
 * @Description: 插件前端描述
 * @Version: 1.0
 */
@Data
public class UiPluginProviderDescriptor {

    private String name;
    private String version;

    private UiPluginManifest manifest;

    private String entryUrl;

    private String styleUrl;

    @Data
    public static class UiPluginManifest {

        private String format;

        private String entry;

        private String style;
    }
}
