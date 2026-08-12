package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.PluginInfo;
import xyz.lingview.dimstack.service.PluginService;

import java.util.List;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2026/08/03 20:23:41
 * @Description: 插件管理接口
 * @Version: 1.0
 */
@RestController
@RequestMapping("/api/plugins")
@Slf4j
public class PluginController {

    @Autowired
    private PluginService pluginService;

    @GetMapping
    @RequiresPermission("plugin:management")
    public ApiResponse<List<PluginInfo>> list() {
        try {
            return ApiResponse.success(pluginService.list());
        } catch (Exception e) {
            log.error("获取插件列表失败", e);
            return ApiResponse.error(500, "获取插件列表失败: " + e.getMessage());
        }
    }

    @PostMapping("/install")
    @RequiresPermission("plugin:management")
    public ApiResponse<PluginInfo> install(@RequestParam("file") MultipartFile file) {
        try {
            return ApiResponse.success(pluginService.install(file));
        } catch (Exception e) {
            log.error("安装插件失败", e);
            return ApiResponse.error(500, "安装插件失败: " + e.getMessage());
        }
    }

    @PostMapping("/install-from-uri")
    @RequiresPermission("plugin:management")
    public ApiResponse<PluginInfo> installFromUri(@RequestBody Map<String, String> payload) {
        try {
            String url = payload.get("url");
            return ApiResponse.success(pluginService.installFromUri(url));
        } catch (Exception e) {
            log.error("URL 安装插件失败", e);
            return ApiResponse.error(500, "URL 安装插件失败: " + e.getMessage());
        }
    }

    @PostMapping("/{name}/start")
    @RequiresPermission("plugin:management")
    public ApiResponse<Void> start(@PathVariable String name) {
        try {
            pluginService.start(name);
            return ApiResponse.success("插件已启用");
        } catch (Exception e) {
            log.error("启用插件失败: {}", name, e);
            return ApiResponse.error(500, "启用插件失败: " + e.getMessage());
        }
    }

    @PostMapping("/{name}/stop")
    @RequiresPermission("plugin:management")
    public ApiResponse<Void> stop(@PathVariable String name) {
        try {
            pluginService.stop(name);
            return ApiResponse.success("插件已停用");
        } catch (Exception e) {
            log.error("停用插件失败: {}", name, e);
            return ApiResponse.error(500, "停用插件失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{name}")
    @RequiresPermission("plugin:management")
    public ApiResponse<Void> uninstall(@PathVariable String name) {
        try {
            pluginService.uninstall(name);
            return ApiResponse.success("插件已卸载");
        } catch (Exception e) {
            log.error("卸载插件失败: {}", name, e);
            return ApiResponse.error(500, "卸载插件失败: " + e.getMessage());
        }
    }

    @PostMapping("/{name}/upgrade")
    @RequiresPermission("plugin:management")
    public ApiResponse<PluginInfo> upgrade(@PathVariable String name,
                                           @RequestParam("file") MultipartFile file) {
        try {
            return ApiResponse.success(pluginService.upgrade(name, file));
        } catch (Exception e) {
            log.error("升级插件失败: {}", name, e);
            return ApiResponse.error(500, "升级插件失败: " + e.getMessage());
        }
    }

    @PostMapping("/{name}/reload")
    @RequiresPermission("plugin:management")
    public ApiResponse<Void> reload(@PathVariable String name) {
        try {
            pluginService.reload(name);
            return ApiResponse.success("插件已重载");
        } catch (Exception e) {
            log.error("重载插件失败: {}", name, e);
            return ApiResponse.error(500, "重载插件失败: " + e.getMessage());
        }
    }

    @GetMapping("/{name}/config")
    @RequiresPermission("plugin:management")
    public ApiResponse<Map<String, Object>> getConfig(@PathVariable String name) {
        try {
            return ApiResponse.success(pluginService.getConfig(name));
        } catch (Exception e) {
            log.error("读取插件配置失败: {}", name, e);
            return ApiResponse.error(500, "读取插件配置失败: " + e.getMessage());
        }
    }

    @PutMapping("/{name}/config")
    @RequiresPermission("plugin:management")
    public ApiResponse<Void> saveConfig(@PathVariable String name, @RequestBody Map<String, Object> config) {
        try {
            pluginService.saveConfig(name, config);
            return ApiResponse.success("插件配置已保存");
        } catch (Exception e) {
            log.error("保存插件配置失败: {}", name, e);
            return ApiResponse.error(500, "保存插件配置失败: " + e.getMessage());
        }
    }
}
