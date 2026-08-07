package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.SmartInitializingSingleton;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerMapping;
import xyz.lingview.dimstack.plugin.api.SettingFetcher;
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
                                                                           SettingFetcher settingFetcher) {
        return new DefaultPluginApplicationContextFactory(rootContext, finder, settingFetcher);
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
        manager.loadPlugins();
        log.info("插件管理器初始化完成, 插件目录: {}", pluginsRoot);
        return manager;
    }

    @Override
    public void afterSingletonsInstantiated() {
        DimStackPluginManager manager = applicationContext.getBean(DimStackPluginManager.class);
        manager.startPlugins();

        applicationContext.getBean(PluginService.class).syncLoadedPlugins();

    }
}
