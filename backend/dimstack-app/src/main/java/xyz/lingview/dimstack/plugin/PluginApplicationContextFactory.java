package xyz.lingview.dimstack.plugin;

import org.pf4j.PluginWrapper;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 插件容器工厂接口
 * @Version: 1.0
 */
public interface PluginApplicationContextFactory {

    AnnotationConfigApplicationContext create(PluginWrapper wrapper);

    void destroy(PluginWrapper wrapper, AnnotationConfigApplicationContext context);
}
