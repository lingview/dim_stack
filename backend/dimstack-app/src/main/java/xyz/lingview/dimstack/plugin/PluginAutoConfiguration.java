package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.SmartInitializingSingleton;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerMapping;
import xyz.lingview.dimstack.service.PluginService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 插件自动装配
 * @Version: 1.0
 */
@Slf4j
@Configuration
public class PluginAutoConfiguration implements SmartInitializingSingleton {

    private final ApplicationContext applicationContext;

    public PluginAutoConfiguration(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @Bean
    public YamlPluginDescriptorFinder yamlPluginDescriptorFinder() {
        return new YamlPluginDescriptorFinder();
    }

    @Bean
    public PluginApplicationContextFactory pluginApplicationContextFactory(ApplicationContext rootContext,
                                                                           YamlPluginDescriptorFinder finder,
                                                                           SettingFetcherImpl settingFetcher,
                                                                           PluginDbRegistry pluginDbRegistry) {
        return new DefaultPluginApplicationContextFactory(rootContext, finder, settingFetcher, pluginDbRegistry);
    }

    @Bean
    public HandlerMapping pluginRequestMappingHandlerMapping() {
        PluginRequestMappingHandlerMapping mapping = new PluginRequestMappingHandlerMapping();
        mapping.setOrder(1);
        return mapping;
    }

    @Bean(destroyMethod = "stopPlugins")
    public DimStackPluginManager dimStackPluginManager(PluginApplicationContextFactory factory,
                                                       HandlerMapping pluginRequestMappingHandlerMapping,
                                                       YamlPluginDescriptorFinder yamlPluginDescriptorFinder) {
        Path pluginsRoot = Path.of(System.getProperty("user.dir"), "plugins");
        try {
            Files.createDirectories(pluginsRoot);
        } catch (IOException e) {
            log.warn("创建插件目录失败: {}", pluginsRoot, e);
        }
        DimStackPluginManager manager = new DimStackPluginManager(pluginsRoot, factory, yamlPluginDescriptorFinder);
        if (pluginRequestMappingHandlerMapping instanceof PluginRequestMappingHandlerMapping mapping) {
            manager.setRequestMappingHandlerMapping(mapping);
        }
        try {
            manager.loadPlugins();
        } catch (Exception e) {

            log.error("插件扫描加载失败(不影响宿主启动, 请检查 plugins 目录)", e);
        }
        log.info("插件管理器初始化完成, 插件目录: {}", pluginsRoot);
        return manager;
    }

    @Override
    public void afterSingletonsInstantiated() {
        PluginService pluginService = applicationContext.getBean(PluginService.class);

        try {
            pluginService.startEnabledPlugins();
        } catch (Exception e) {
            log.error("插件启动阶段失败(不影响宿主启动)", e);
        }

        try {
            pluginService.syncLoadedPlugins();
        } catch (Exception e) {
            log.error("插件启动同步失败(不影响宿主启动)", e);
        }

    }
}
