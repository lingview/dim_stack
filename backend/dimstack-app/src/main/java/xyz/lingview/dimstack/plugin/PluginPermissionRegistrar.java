package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import xyz.lingview.dimstack.mapper.PermissionMapper;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * @Author: lingview
 * @Date: 2026/10/09 14:40:31
 * @Description: 插件权限码注册与清理
 * @Version: 1.0
 */
@Slf4j
@Component
public class PluginPermissionRegistrar {

    private static final String CODE_LITERAL_PREFIX = "plugin:";

    private final PermissionMapper permissionMapper;

    public PluginPermissionRegistrar(PermissionMapper permissionMapper) {
        this.permissionMapper = permissionMapper;
    }

    public void registerOnStart(String pluginId, PluginManifest manifest) {
        try {
            if (manifest == null || manifest.getPermissions() == null) {
                return;
            }
            Set<String> declared = new HashSet<>();
            for (PluginPermission permission : manifest.getPermissions()) {
                String fullCode = fullCode(pluginId, permission.getCode());
                declared.add(fullCode);
                permissionMapper.upsertCode(fullCode, permission.getName());
            }
            List<String> stale = ownedCodes(pluginId).stream()
                    .filter(code -> !declared.contains(code))
                    .toList();
            if (!stale.isEmpty()) {
                permissionMapper.deleteByCodes(stale);
                log.info("已清理插件未再声明的权限码: {} ({})", pluginId, stale);
            }
        } catch (Exception e) {
            log.error("插件权限码注册失败(插件继续启动, 相关接口可能不可授权): {} ({})", pluginId, e.getMessage(), e);
        }
    }

    public void unregisterOnUninstall(String pluginId) {
        try {
            List<String> owned = ownedCodes(pluginId);
            if (!owned.isEmpty()) {
                permissionMapper.deleteByCodes(owned);
                log.info("插件权限码已清理: {} ({})", pluginId, owned);
            }
        } catch (Exception e) {
            log.error("插件权限码清理失败: {} ({})", pluginId, e.getMessage(), e);
        }
    }

    private List<String> ownedCodes(String pluginId) {
        String ownedPrefix = fullCode(pluginId, "");
        return permissionMapper.findCodesByLiteralPrefix(CODE_LITERAL_PREFIX).stream()
                .filter(code -> code.startsWith(ownedPrefix))
                .toList();
    }

    private String fullCode(String pluginId, String shortCode) {
        return CODE_LITERAL_PREFIX + pluginId + ":" + shortCode;
    }
}
