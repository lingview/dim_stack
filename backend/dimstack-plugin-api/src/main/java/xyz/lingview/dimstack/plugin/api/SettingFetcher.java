package xyz.lingview.dimstack.plugin.api;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 插件配置读取接口
 * @Version: 1.0
 */
public interface SettingFetcher {

    <T> T fetch(String configMapName, String key, Class<T> clazz);
}
