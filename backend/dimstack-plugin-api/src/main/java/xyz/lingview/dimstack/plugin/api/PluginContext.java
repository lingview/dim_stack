package xyz.lingview.dimstack.plugin.api;

import org.pf4j.PluginWrapper;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 插件上下文
 * @Version: 1.0
 */
public class PluginContext {

    private final PluginWrapper wrapper;
    private final String settingName;
    private final String configMapName;
    private final RuntimeMode runtimeMode;

    public PluginContext(PluginWrapper wrapper, String settingName, String configMapName, RuntimeMode runtimeMode) {
        this.wrapper = wrapper;
        this.settingName = settingName;
        this.configMapName = configMapName;
        this.runtimeMode = runtimeMode;
    }

    public String getName() {
        return wrapper.getPluginId();
    }

    public String getVersion() {
        return wrapper.getDescriptor().getVersion();
    }

    public PluginWrapper getWrapper() {
        return wrapper;
    }

    public String getSettingName() {
        return settingName;
    }

    public String getConfigMapName() {
        return configMapName;
    }

    public RuntimeMode getRuntimeMode() {
        return runtimeMode;
    }

    public enum RuntimeMode {

        DEVELOPMENT,

        DEPLOYMENT
    }
}
