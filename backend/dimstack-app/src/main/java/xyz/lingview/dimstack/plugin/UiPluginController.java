package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.common.ApiResponse;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/08/14 20:47:33
 * @Description: 插件前端信息接口
 * @Version: 1.0
 */
@Slf4j
@RestController
public class UiPluginController {

    private final UiPluginBundleService uiPluginBundleService;

    public UiPluginController(UiPluginBundleService uiPluginBundleService) {
        this.uiPluginBundleService = uiPluginBundleService;
    }

    @GetMapping("/api/ui-plugins/providers")
    public ApiResponse<List<UiPluginProviderDescriptor>> providers() {
        try {
            return ApiResponse.success(uiPluginBundleService.listProviders());
        } catch (Exception e) {
            log.error("获取插件 UI providers 失败", e);
            return ApiResponse.error(500, "获取插件 UI providers 失败: " + e.getMessage());
        }
    }
}
