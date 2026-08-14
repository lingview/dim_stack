package xyz.lingview.dimstack.plugin;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/08/14 20:47:33
 * @Description: 插件前端信息接口
 * @Version: 1.0
 */
public interface UiPluginBundleService {

    List<UiPluginProviderDescriptor> listProviders();
}
