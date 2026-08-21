package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.pf4j.PluginWrapper;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.beans.factory.support.RootBeanDefinition;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;
import org.springframework.util.ClassUtils;
import org.springframework.util.StringUtils;
import org.yaml.snakeyaml.Yaml;
import xyz.lingview.dimstack.plugin.api.ExtensionGetter;
import xyz.lingview.dimstack.plugin.api.PluginContext;
import xyz.lingview.dimstack.plugin.api.SettingFetcher;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.service.SiteConfigService;
import xyz.lingview.dimstack.service.StorageFacadeService;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 插件Spring容器工厂
 * @Version: 1.0
 */
@Slf4j
public class DefaultPluginApplicationContextFactory implements PluginApplicationContextFactory {

    private static final List<SharedBean> SHARED_BEANS = List.of(
            new SharedBean(SiteConfigService.class, ctx -> ctx.getBean(SiteConfigService.class)),
            new SharedBean(CacheService.class, ctx -> ctx.getBean(CacheService.class)),
            new SharedBean(StorageFacadeService.class, ctx -> ctx.getBean(StorageFacadeService.class)),
            new SharedBean(ExtensionGetter.class, ctx -> ctx.getBean(ExtensionGetter.class))
    );

    private final ApplicationContext rootContext;
    private final YamlPluginDescriptorFinder descriptorFinder;
    private final SettingFetcher settingFetcher;

    private volatile AnnotationConfigApplicationContext sharedContext;

    public DefaultPluginApplicationContextFactory(ApplicationContext rootContext,
                                                  YamlPluginDescriptorFinder descriptorFinder,
                                                  SettingFetcher settingFetcher) {
        this.rootContext = rootContext;
        this.descriptorFinder = descriptorFinder;
        this.settingFetcher = settingFetcher;
    }

    @Override
    public AnnotationConfigApplicationContext create(PluginWrapper wrapper) {
        PluginManifest manifest = descriptorFinder.getManifest(wrapper.getPluginId());

        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.setParent(getSharedContext());
        context.setClassLoader(wrapper.getPluginClassLoader());
        context.setId("plugin-" + wrapper.getPluginId());

        PluginContext pluginContext = new PluginContext(
                wrapper,
                manifest != null ? manifest.getSettingName() : null,
                manifest != null ? manifest.getConfigMapName() : null,
                PluginContext.RuntimeMode.DEPLOYMENT);

        DefaultListableBeanFactory beanFactory = (DefaultListableBeanFactory) context.getBeanFactory();
        RootBeanDefinition pluginContextDef = new RootBeanDefinition(PluginContext.class);
        pluginContextDef.setInstanceSupplier(() -> pluginContext);
        pluginContextDef.setPrimary(true);
        beanFactory.registerBeanDefinition("pluginContext", pluginContextDef);

        RootBeanDefinition settingFetcherDef = new RootBeanDefinition(SettingFetcher.class);
        settingFetcherDef.setInstanceSupplier(() -> new BoundSettingFetcher(wrapper.getPluginId(), settingFetcher));
        settingFetcherDef.setPrimary(true);
        beanFactory.registerBeanDefinition("boundSettingFetcher", settingFetcherDef);
        registerConfigYaml(context, wrapper);

        registerComponents(context, wrapper, manifest);

        Thread original = Thread.currentThread();
        ClassLoader originalLoader = original.getContextClassLoader();
        Thread.currentThread().setContextClassLoader(wrapper.getPluginClassLoader());
        try {
            context.refresh();
        } finally {
            Thread.currentThread().setContextClassLoader(originalLoader);
        }
        log.info("插件上下文创建成功: {}@{}", wrapper.getPluginId(), wrapper.getDescriptor().getVersion());
        return context;
    }

    @Override
    public void destroy(PluginWrapper wrapper, AnnotationConfigApplicationContext context) {
        try {
            context.close();
        } catch (Exception e) {
            log.warn("插件上下文关闭异常: {}", wrapper.getPluginId(), e);
        }
    }

    private AnnotationConfigApplicationContext getSharedContext() {
        if (sharedContext == null) {
            synchronized (this) {
                if (sharedContext == null) {
                    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
                    context.setParent(rootContext);
                    context.setId("plugin-shared");
                    DefaultListableBeanFactory beanFactory = (DefaultListableBeanFactory) context.getBeanFactory();
                    for (SharedBean bean : SHARED_BEANS) {
                        @SuppressWarnings({"rawtypes", "unchecked"})
                        Class<?> beanType = (Class) bean.type;
                        RootBeanDefinition definition = new RootBeanDefinition(beanType);
                        definition.setInstanceSupplier(() -> bean.resolver.apply(rootContext));
                        definition.setPrimary(true);
                        beanFactory.registerBeanDefinition(beanType.getName(), definition);
                    }
                    context.refresh();
                    sharedContext = context;
                }
            }
        }
        return sharedContext;
    }

    private void registerComponents(AnnotationConfigApplicationContext context,
                                    PluginWrapper wrapper,
                                    PluginManifest manifest) {
        if (manifest == null || !StringUtils.hasText(manifest.getScanPackage())) {
            log.warn("插件 {} 未配置 scanPackage, 不注册 Spring 组件", wrapper.getPluginId());
            return;
        }
        ClassPathScanningCandidateComponentProvider scanner = new ClassPathScanningCandidateComponentProvider(false);
        scanner.setResourceLoader(new PathMatchingResourcePatternResolver(wrapper.getPluginClassLoader()));
        scanner.addIncludeFilter(new AnnotationTypeFilter(Component.class, true, true));

        Set<BeanDefinition> candidates;
        try {
            candidates = scanner.findCandidateComponents(manifest.getScanPackage());
        } catch (Exception e) {
            log.warn("插件 {} 组件扫描失败: {}", wrapper.getPluginId(), e.getMessage());
            return;
        }
        for (BeanDefinition definition : candidates) {
            String className = definition.getBeanClassName();
            if (!StringUtils.hasText(className)) {
                continue;
            }
            try {
                Class<?> clazz = ClassUtils.forName(className, wrapper.getPluginClassLoader());
                context.registerBean(clazz);
            } catch (Exception e) {
                log.warn("插件 {} 组件注册失败: {}", wrapper.getPluginId(), className, e);
            }
        }
        log.info("插件 {} 注册组件 {} 个", wrapper.getPluginId(), candidates.size());
    }

    private void registerConfigYaml(AnnotationConfigApplicationContext context, PluginWrapper wrapper) {
        try (InputStream in = wrapper.getPluginClassLoader().getResourceAsStream("config.yaml")) {
            if (in == null) {
                return;
            }
            Object loaded = new Yaml().load(in);
            if (!(loaded instanceof Map<?, ?> map) || map.isEmpty()) {
                return;
            }
            Map<String, Object> flat = new HashMap<>();
            flatten("", (Map<String, Object>) map, flat);
            context.getEnvironment().getPropertySources().addLast(
                    new MapPropertySource("plugin-config-" + wrapper.getPluginId(), flat));
        } catch (Exception e) {
            log.warn("插件默认配置加载失败: {}", wrapper.getPluginId(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private void flatten(String prefix, Map<String, Object> source, Map<String, Object> target) {
        source.forEach((key, value) -> {
            String fullKey = prefix.isEmpty() ? key : prefix + "." + key;
            if (value instanceof Map<?, ?> nested) {
                flatten(fullKey, (Map<String, Object>) nested, target);
            } else {
                target.put(fullKey, value);
            }
        });
    }

    private record BoundSettingFetcher(String pluginId, SettingFetcher delegate) implements SettingFetcher {
        @Override
        public <T> T fetch(String configMapName, String key, Class<T> clazz) {
            return delegate.fetch(pluginId, key, clazz);
        }
    }

    private record SharedBean(Class<?> type, java.util.function.Function<ApplicationContext, Object> resolver) {
    }
}
