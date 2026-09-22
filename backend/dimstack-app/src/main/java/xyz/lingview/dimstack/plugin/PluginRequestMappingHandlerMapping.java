package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.condition.PathPatternsRequestCondition;
import org.springframework.web.util.pattern.PathPattern;

import jakarta.servlet.http.HttpServletRequest;

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

    private final Map<String, Set<String>> pluginEndpointPaths = new ConcurrentHashMap<>();

    private final Map<String, String> beanOwners = new ConcurrentHashMap<>();

    private final Set<String> stoppedPlugins = ConcurrentHashMap.newKeySet();

    public synchronized void registerPlugin(String pluginId, AnnotationConfigApplicationContext context) {
        pluginContexts.put(pluginId, context);
        stoppedPlugins.remove(pluginId);

        Map<RequestMappingInfo, HandlerMethod> before = new HashMap<>(getHandlerMethods());
        for (String beanName : context.getBeanDefinitionNames()) {
            Object bean = context.getBean(beanName);
            if (isHandler(bean.getClass())) {
                detectHandlerMethods(bean);
            }
        }
        Set<RequestMappingInfo> added = new HashSet<>(getHandlerMethods().keySet());
        added.removeAll(before.keySet());
        Set<String> endpointPaths = new HashSet<>();
        for (RequestMappingInfo info : added) {
            HandlerMethod handler = getHandlerMethods().get(info);
            if (handler != null) {
                beanOwners.put(handler.getBeanType().getName(), pluginId);
            }
            PathPatternsRequestCondition condition = info.getPathPatternsCondition();
            if (condition != null) {
                for (PathPattern pattern : condition.getPatterns()) {
                    endpointPaths.add(pattern.getPatternString());
                }
            }
        }
        pluginMappings.put(pluginId, added);
        pluginEndpointPaths.put(pluginId, endpointPaths);

        if (!added.isEmpty()) {
            log.info("插件路由注册完成: {} ({} 条路由)", pluginId, added.size());
        }
    }

    public synchronized void unregisterPlugin(String pluginId) {
        pluginContexts.remove(pluginId);

        stoppedPlugins.add(pluginId);
        pluginEndpointPaths.remove(pluginId);
        Set<RequestMappingInfo> mappings = pluginMappings.remove(pluginId);
        if (mappings != null) {
            for (RequestMappingInfo mapping : mappings) {
                unregisterMapping(mapping);
            }
            log.info("插件路由已注销: {}", pluginId);
        }

    }

    @Override
    protected HandlerMethod getHandlerInternal(HttpServletRequest request) throws Exception {
        HandlerMethod handler = super.getHandlerInternal(request);
        if (handler != null) {
            String owner = beanOwners.get(handler.getBeanType().getName());
            if (owner != null && stoppedPlugins.contains(owner)) {

                return null;
            }
        }
        return handler;
    }

    public boolean hasEndpoint(String pluginId, String path) {
        if (stoppedPlugins.contains(pluginId)) {
            return false;
        }
        Set<String> paths = pluginEndpointPaths.get(pluginId);
        return paths != null && paths.contains(path);
    }
}
