package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import xyz.lingview.dimstack.security.AuthenticatedUser;
import xyz.lingview.dimstack.security.UserContextHolder;

/**
 * @Author: lingview
 * @Date: 2026/08/12 21:52:04
 * @Description: 插件操作审计
 * @Version: 1.0
 */
@Slf4j
@Component
public class PluginAuditLogger {

    public void log(String action, String pluginId, String version, boolean success, String detail) {
        String operator = "unknown";
        AuthenticatedUser user = UserContextHolder.get();
        if (user != null) {
            operator = user.getUsername();
        }
        String plugin = pluginId + (version != null ? "@" + version : "");
        if (success) {
            log.info("[插件审计] 操作者={} 动作={} 插件={} 详情={}", operator, action, plugin, detail == null ? "-" : detail);
        } else {
            log.warn("[插件审计] 操作者={} 动作={} 插件={} 失败: {}", operator, action, plugin, detail == null ? "-" : detail);
        }
    }
}
