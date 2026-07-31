package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.pf4j.Plugin;
import org.pf4j.PluginRuntimeException;
import org.pf4j.PluginWrapper;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 插件Spring生命周期
 * @Version: 1.0
 */
@Slf4j
public class DefaultSpringPlugin extends Plugin {

    private final PluginApplicationContextFactory contextFactory;
    private final DimStackPluginManager pluginManager;
    private final PluginRequestMappingHandlerMapping handlerMapping;

    private volatile AnnotationConfigApplicationContext applicationContext;

    public DefaultSpringPlugin(PluginWrapper wrapper,
                               PluginApplicationContextFactory contextFactory,
                               DimStackPluginManager pluginManager,
                               PluginRequestMappingHandlerMapping handlerMapping) {
        super(wrapper);
        this.contextFactory = contextFactory;
        this.pluginManager = pluginManager;
        this.handlerMapping = handlerMapping;
    }

    @Override
    public void start() {
        try {
            AnnotationConfigApplicationContext context = contextFactory.create(getWrapper());
            this.applicationContext = context;
            pluginManager.registerPluginContext(getWrapper().getPluginId(), context);
            if (handlerMapping != null) {
                handlerMapping.registerPlugin(getWrapper().getPluginId(), context);
            }
        } catch (Exception e) {
            throw new PluginRuntimeException("插件启动失败: " + getWrapper().getPluginId(), e);
        }
    }

    @Override
    public void stop() {
        AnnotationConfigApplicationContext context = this.applicationContext;
        if (context != null) {
            try {
                if (handlerMapping != null) {
                    handlerMapping.unregisterPlugin(getWrapper().getPluginId());
                }
            } finally {
                contextFactory.destroy(getWrapper(), context);
                this.applicationContext = null;
                pluginManager.removePluginContext(getWrapper().getPluginId());
            }
        }
    }

    public AnnotationConfigApplicationContext getApplicationContext() {
        return applicationContext;
    }
}
