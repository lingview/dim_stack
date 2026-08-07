package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.pf4j.PluginWrapper;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;
import xyz.lingview.dimstack.domain.DashboardMenu;
import xyz.lingview.dimstack.mapper.DashboardMenuMapper;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

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

    public PluginExtensionLoader(DashboardMenuMapper dashboardMenuMapper) {
        this.dashboardMenuMapper = dashboardMenuMapper;
    }

    public void loadPluginExtensions(String pluginId, PluginWrapper wrapper) {
        dashboardMenuMapper.deleteByLinkPrefix("/dashboard/plugins/" + pluginId + "/");

        InputStream in = wrapper.getPluginClassLoader().getResourceAsStream(MENU_FILE);
        if (in == null) {
            return;
        }
        try (in) {
            Object loaded = new Yaml().load(in);
            if (!(loaded instanceof Map<?, ?> map)) {
                return;
            }
            Object menus = ((Map<String, Object>) map).get("dashboard-menu");
            if (!(menus instanceof List<?> menuList) || menuList.isEmpty()) {
                return;
            }

            Integer baseSort = dashboardMenuMapper.selectMaxSortByParent(PLUGIN_MENU_PARENT_ID);
            Integer maxId = dashboardMenuMapper.selectMaxId();
            int sort = baseSort == null ? 0 : baseSort;
            int id = maxId == null ? 0 : maxId;
            int count = 0;
            for (Object item : menuList) {
                if (!(item instanceof Map<?, ?> menuMap)) {
                    continue;
                }
                DashboardMenu menu = new DashboardMenu();
                menu.setId(++id);
                menu.setTitle(String.valueOf(((Map<String, Object>) menuMap).get("title")));
                menu.setLink(String.valueOf(((Map<String, Object>) menuMap).get("link")));
                Object icon = ((Map<String, Object>) menuMap).get("icon");
                menu.setIcon(icon != null ? icon.toString() : "plugin");
                Object permission = ((Map<String, Object>) menuMap).get("permission");
                menu.setPermission_code(permission != null ? permission.toString() : DEFAULT_PERMISSION);
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
        int deleted = dashboardMenuMapper.deleteByLinkPrefix("/dashboard/plugins/" + pluginId + "/");
        if (deleted > 0) {
            log.info("插件菜单贡献已清理: {} ({} 条)", pluginId, deleted);
        }
    }
}
