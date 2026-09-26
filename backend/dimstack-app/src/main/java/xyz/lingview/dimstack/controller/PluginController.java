package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.pf4j.PluginRuntimeException;
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

    private <T> ApiResponse<T> fail(String action, Exception e) {
        if (e instanceof PluginRuntimeException) {
            log.warn("{} 失败: {}", action, e.getMessage());
            return ApiResponse.error(500, e.getMessage());
        }
        String traceId = Long.toHexString(System.nanoTime());
        log.error("{} 失败, 错误编号={}", action, traceId, e);
        return ApiResponse.error(500, action + "失败, 请稍后重试(错误编号 " + traceId + ")");
    }

    @GetMapping
    @RequiresPermission("plugin:management")
    public ApiResponse<List<PluginInfo>> list() {
        try {
            return ApiResponse.success(pluginService.list());
        } catch (Exception e) {
            return fail("获取插件列表", e);
        }
    }

    @PostMapping("/install")
    @RequiresPermission("plugin:management")
    public ApiResponse<PluginInfo> install(@RequestParam("file") MultipartFile file) {
        try {
            return ApiResponse.success(pluginService.install(file));
        } catch (Exception e) {
            return fail("安装插件", e);
        }
    }

    @PostMapping("/{name}/start")
    @RequiresPermission("plugin:management")
    public ApiResponse<Void> start(@PathVariable String name) {
        try {
            pluginService.start(name);
            return ApiResponse.success("插件已启用");
        } catch (Exception e) {
            return fail("启用插件", e);
        }
    }

    @PostMapping("/{name}/stop")
    @RequiresPermission("plugin:management")
    public ApiResponse<Void> stop(@PathVariable String name) {
        try {
            pluginService.stop(name);
            return ApiResponse.success("插件已停用");
        } catch (Exception e) {
            return fail("停用插件", e);
        }
    }

    @DeleteMapping("/{name}")
    @RequiresPermission("plugin:management")
    public ApiResponse<Void> uninstall(@PathVariable String name) {
        try {
            pluginService.uninstall(name);
            return ApiResponse.success("插件已卸载");
        } catch (Exception e) {
            return fail("卸载插件", e);
        }
    }

    @PostMapping("/{name}/upgrade")
    @RequiresPermission("plugin:management")
    public ApiResponse<PluginInfo> upgrade(@PathVariable String name,
                                           @RequestParam("file") MultipartFile file) {
        try {
            return ApiResponse.success(pluginService.upgrade(name, file));
        } catch (Exception e) {
            return fail("升级插件", e);
        }
    }

    @PostMapping("/{name}/reload")
    @RequiresPermission("plugin:management")
    public ApiResponse<Void> reload(@PathVariable String name) {
        try {
            pluginService.reload(name);
            return ApiResponse.success("插件已重载");
        } catch (Exception e) {
            return fail("重载插件", e);
        }
    }

    @GetMapping("/{name}/config")
    @RequiresPermission("plugin:management")
    public ApiResponse<Map<String, Object>> getConfig(@PathVariable String name) {
        try {
            return ApiResponse.success(pluginService.getConfig(name));
        } catch (Exception e) {
            return fail("读取插件配置", e);
        }
    }

    @PutMapping("/{name}/config")
    @RequiresPermission("plugin:management")
    public ApiResponse<Void> saveConfig(@PathVariable String name, @RequestBody Map<String, Object> config) {
        try {
            pluginService.saveConfig(name, config);
            return ApiResponse.success("插件配置已保存");
        } catch (Exception e) {
            return fail("保存插件配置", e);
        }
    }
}
