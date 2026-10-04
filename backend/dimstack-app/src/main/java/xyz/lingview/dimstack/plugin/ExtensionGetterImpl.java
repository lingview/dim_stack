package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.pf4j.PluginWrapper;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.core.annotation.AnnotationAwareOrderComparator;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.plugin.api.ExtensionGetter;
import xyz.lingview.dimstack.plugin.api.ExtensionPoint;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 扩展点获取实现
 * @Version: 1.0
 */
@Slf4j
@Service
public class ExtensionGetterImpl implements ExtensionGetter {

    private final DimStackPluginManager pluginManager;
    private final ApplicationContext applicationContext;
    private final PluginLifecycleGuard lifecycleGuard;

    public ExtensionGetterImpl(DimStackPluginManager pluginManager,
                               ApplicationContext applicationContext,
                               PluginLifecycleGuard lifecycleGuard) {
        this.pluginManager = pluginManager;
        this.applicationContext = applicationContext;
        this.lifecycleGuard = lifecycleGuard;
    }

    @Override
    public <T extends ExtensionPoint> List<T> getExtensions(Class<T> type) {
        return lifecycleGuard.withReadLock(() -> doGetExtensions(type));
    }

    private <T extends ExtensionPoint> List<T> doGetExtensions(Class<T> type) {
        List<T> extensions = new ArrayList<>();
        for (PluginWrapper wrapper : pluginManager.getStartedPlugins()) {
            AnnotationConfigApplicationContext context = pluginManager.getPluginContext(wrapper.getPluginId());
            if (context != null && context.isActive()) {
                try {
                    extensions.addAll(context.getBeansOfType(type).values());
                } catch (Exception e) {
                    log.warn("收集插件 {} 的扩展失败: {}", wrapper.getPluginId(), e.getMessage());
                }
            }
        }
        extensions.addAll(applicationContext.getBeanProvider(type).orderedStream().toList());
        extensions.sort(AnnotationAwareOrderComparator.INSTANCE);
        return extensions;
    }
}
