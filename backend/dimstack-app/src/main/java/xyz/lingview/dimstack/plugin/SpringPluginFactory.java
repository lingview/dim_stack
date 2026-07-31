package xyz.lingview.dimstack.plugin;

import org.pf4j.DefaultPluginFactory;
import org.pf4j.Plugin;
import org.pf4j.PluginWrapper;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 插件实例工厂
 * @Version: 1.0
 */
public class SpringPluginFactory extends DefaultPluginFactory {

    private final PluginApplicationContextFactory contextFactory;
    private final DimStackPluginManager pluginManager;

    public SpringPluginFactory(PluginApplicationContextFactory contextFactory,
                               DimStackPluginManager pluginManager) {
        this.contextFactory = contextFactory;
        this.pluginManager = pluginManager;
    }

    @Override
    public Plugin create(PluginWrapper pluginWrapper) {
        return new DefaultSpringPlugin(pluginWrapper, contextFactory, pluginManager,
                pluginManager.getRequestMappingHandlerMapping());
    }
}
