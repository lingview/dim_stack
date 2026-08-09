package xyz.lingview.dimstack.service;

import org.springframework.web.multipart.MultipartFile;
import xyz.lingview.dimstack.domain.PluginInfo;

import java.util.List;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2026/08/03 20:23:41
 * @Description: 插件管理服务
 * @Version: 1.0
 */
public interface PluginService {

    List<PluginInfo> list();

    PluginInfo install(MultipartFile file);

    boolean start(String name);

    boolean stop(String name);

    boolean uninstall(String name);

    PluginInfo upgrade(String name, MultipartFile file);

    boolean reload(String name);

    void syncLoadedPlugins();

    Map<String, Object> getConfig(String name);

    boolean saveConfig(String name, Map<String, Object> config);
}
