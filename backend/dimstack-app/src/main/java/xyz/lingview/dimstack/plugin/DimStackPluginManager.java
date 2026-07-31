package xyz.lingview.dimstack.plugin;

import org.pf4j.DefaultPluginManager;
import org.pf4j.PluginDescriptorFinder;
import org.pf4j.PluginFactory;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 插件管理器
 * @Version: 1.0
 */
public class DimStackPluginManager extends DefaultPluginManager {

    private final PluginApplicationContextFactory contextFactory;
    private final YamlPluginDescriptorFinder descriptorFinder;
    private final Map<String, AnnotationConfigApplicationContext> pluginContexts = new ConcurrentHashMap<>();

    private PluginRequestMappingHandlerMapping requestMappingHandlerMapping;

    public DimStackPluginManager(Path pluginsRoot,
                                 PluginApplicationContextFactory contextFactory,
                                 YamlPluginDescriptorFinder descriptorFinder) {
        super(pluginsRoot);
        this.contextFactory = contextFactory;
        this.descriptorFinder = descriptorFinder;
        // pf4j的initialize()在父构造器期间即调用本类覆写的工厂方法, 子类字段此时未初始化, 故字段就绪后重新initialize()

        initialize();
    }

    @Override
    protected PluginDescriptorFinder createPluginDescriptorFinder() {
        return descriptorFinder;
    }

    @Override
    protected PluginFactory createPluginFactory() {
        return new SpringPluginFactory(contextFactory, this);
    }

    @Override
    protected org.pf4j.VersionManager createVersionManager() {
        return new org.pf4j.DefaultVersionManager() {
            @Override
            public boolean checkVersionConstraint(String requires, String version) {
                return true;
            }
        };
    }

    public void setRequestMappingHandlerMapping(PluginRequestMappingHandlerMapping mapping) {
        this.requestMappingHandlerMapping = mapping;
    }

    public PluginRequestMappingHandlerMapping getRequestMappingHandlerMapping() {
        return requestMappingHandlerMapping;
    }

    public PluginManifest getManifest(String pluginId) {
        return descriptorFinder.getManifest(pluginId);
    }

    public void removeManifest(String pluginId) {
        descriptorFinder.removeManifest(pluginId);
    }

    public AnnotationConfigApplicationContext getPluginContext(String pluginId) {
        return pluginContexts.get(pluginId);
    }

    public void registerPluginContext(String pluginId, AnnotationConfigApplicationContext context) {
        pluginContexts.put(pluginId, context);
    }

    public void removePluginContext(String pluginId) {
        pluginContexts.remove(pluginId);
    }

    public void cleanupPlugin(String pluginId) {
        removePluginContext(pluginId);
        removeManifest(pluginId);
    }
}
