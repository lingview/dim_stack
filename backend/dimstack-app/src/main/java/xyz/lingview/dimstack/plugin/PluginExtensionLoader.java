package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.pf4j.PluginWrapper;
import org.springframework.stereotype.Component;
import xyz.lingview.dimstack.domain.DashboardMenu;
import xyz.lingview.dimstack.mapper.DashboardMenuMapper;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @Author: lingview
 * @Date: 2026/08/07 19:38:56
 * @Description: 插件菜单加载
 * @Version: 1.0
 */
@Slf4j
@Component
public class PluginExtensionLoader {

    private static final Integer PLUGIN_MENU_PARENT_ID = 113;
    private static final String MENU_FILE = "extensions/menu.yaml";
    private static final String DEFAULT_PERMISSION = "plugin:management";

    private final DashboardMenuMapper dashboardMenuMapper;
    private final YamlPluginDescriptorFinder descriptorFinder;

    public PluginExtensionLoader(DashboardMenuMapper dashboardMenuMapper,
                                 YamlPluginDescriptorFinder descriptorFinder) {
        this.dashboardMenuMapper = dashboardMenuMapper;
        this.descriptorFinder = descriptorFinder;
    }

    public void loadPluginExtensions(String pluginId, PluginWrapper wrapper) {
        deletePluginMenus(pluginId);

        InputStream in = wrapper.getPluginClassLoader().getResourceAsStream(MENU_FILE);
        if (in == null) {
            return;
        }
        try (in) {
            Map<String, Object> loaded = PluginYamlLoader.load(in);
            Object menus = loaded.get("dashboard-menu");
            if (!(menus instanceof List<?> menuList) || menuList.isEmpty()) {
                return;
            }

            Set<String> declaredPermissions = declaredPermissions(pluginId);
            Integer baseSort = dashboardMenuMapper.selectMaxSortByParent(PLUGIN_MENU_PARENT_ID);
            int sort = baseSort == null ? 0 : baseSort;
            int count = 0;
            for (Object item : menuList) {
                if (!(item instanceof Map<?, ?> menuMap)) {
                    continue;
                }
                DashboardMenu menu = new DashboardMenu();
                menu.setTitle(String.valueOf(((Map<String, Object>) menuMap).get("title")));
                menu.setLink(String.valueOf(((Map<String, Object>) menuMap).get("link")));
                Object icon = ((Map<String, Object>) menuMap).get("icon");
                menu.setIcon(icon != null ? icon.toString() : "plugin");
                Object permission = ((Map<String, Object>) menuMap).get("permission");
                String permissionCode = permission != null ? permission.toString() : DEFAULT_PERMISSION;
                if (!permissionCode.contains(":")) {
                    String expanded = "plugin:" + pluginId + ":" + permissionCode;
                    if (!declaredPermissions.contains(expanded)) {
                        log.warn("插件菜单权限码未在 plugin.yaml 的 permissions 中声明, 已跳过该菜单项: {} (permission={})",
                                pluginId, permissionCode);
                        continue;
                    }
                    permissionCode = expanded;
                }
                menu.setPermission_code(permissionCode);
                menu.setParent_id(PLUGIN_MENU_PARENT_ID);
                menu.setSort_order(++sort);
                menu.setType("sidebar");
                dashboardMenuMapper.insert(menu);
                count++;
            }
            if (count > 0) {
                log.info("插件菜单贡献已加载: {} ({} 条)", pluginId, count);
            }
        } catch (Exception e) {
            log.warn("插件数据贡献加载失败: {}", pluginId, e);
        }
    }

    public void cleanupPluginExtensions(String pluginId) {
        int deleted = deletePluginMenus(pluginId);
        if (deleted > 0) {
            log.info("插件菜单贡献已清理: {} ({} 条)", pluginId, deleted);
        }
    }

    private Set<String> declaredPermissions(String pluginId) {
        PluginManifest manifest = descriptorFinder.getManifest(pluginId);
        if (manifest == null || manifest.getPermissions() == null) {
            return Set.of();
        }
        return manifest.getPermissions().stream()
                .map(permission -> "plugin:" + pluginId + ":" + permission.getCode())
                .collect(Collectors.toSet());
    }

    private int deletePluginMenus(String pluginId) {
        String prefix = "/dashboard/plugins/" + pluginId + "/";
        List<Integer> ids = dashboardMenuMapper.findByLinkPrefix(prefix).stream()
                .filter(menu -> menu.getLink() != null && menu.getLink().startsWith(prefix))
                .map(DashboardMenu::getId)
                .toList();
        return ids.isEmpty() ? 0 : dashboardMenuMapper.deleteByIds(ids);
    }
}
