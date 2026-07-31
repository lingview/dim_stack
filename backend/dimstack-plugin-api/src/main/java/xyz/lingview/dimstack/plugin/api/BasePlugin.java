package xyz.lingview.dimstack.plugin.api;

import org.pf4j.Plugin;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 插件基类
 * @Version: 1.0
 */
public abstract class BasePlugin extends Plugin {

    private final PluginContext pluginContext;

    protected BasePlugin(PluginContext pluginContext) {
        super(pluginContext.getWrapper());
        this.pluginContext = pluginContext;
    }

    public PluginContext getPluginContext() {
        return pluginContext;
    }
}
