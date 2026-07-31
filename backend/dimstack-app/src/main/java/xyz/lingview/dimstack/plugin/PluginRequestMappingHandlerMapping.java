package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 插件路由注册
 * @Version: 1.0
 */
@Slf4j
public class PluginRequestMappingHandlerMapping extends RequestMappingHandlerMapping {

    private final Map<String, AnnotationConfigApplicationContext> pluginContexts = new ConcurrentHashMap<>();
    private final Map<String, Set<RequestMappingInfo>> pluginMappings = new ConcurrentHashMap<>();

    public void registerPlugin(String pluginId, AnnotationConfigApplicationContext context) {
        pluginContexts.put(pluginId, context);

        Map<RequestMappingInfo, HandlerMethod> before = new HashMap<>(getHandlerMethods());
        for (String beanName : context.getBeanDefinitionNames()) {
            Object bean = context.getBean(beanName);
            if (isHandler(bean.getClass())) {
                detectHandlerMethods(bean);
            }
        }
        Set<RequestMappingInfo> added = new HashSet<>(getHandlerMethods().keySet());
        added.removeAll(before.keySet());
        pluginMappings.put(pluginId, added);

        if (!added.isEmpty()) {
            log.info("插件路由注册完成: {} ({} 条路由)", pluginId, added.size());
        }
    }

    public void unregisterPlugin(String pluginId) {
        pluginContexts.remove(pluginId);
        Set<RequestMappingInfo> mappings = pluginMappings.remove(pluginId);
        if (mappings != null) {
            for (RequestMappingInfo mapping : mappings) {
                unregisterMapping(mapping);
            }
            log.info("插件路由已注销: {}", pluginId);
        }
    }
}
