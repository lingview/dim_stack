package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.LlmConfig;
import xyz.lingview.dimstack.service.LlmConfigService;

@RestController
@RequestMapping("/api/llm")
@Slf4j
public class LlmConfigController {

    @Autowired
    private LlmConfigService llmConfigService;

    @GetMapping("/config")
    @RequiresPermission("system:config:management")
    public ApiResponse<LlmConfig> getLlmConfig() {
        log.info("获取LLM配置信息");
        try {
            LlmConfig config = llmConfigService.getLlmConfig();
            if (config != null) {
                LlmConfig safeConfig = new LlmConfig();
                safeConfig.setApi_url(config.getApi_url());
                safeConfig.setModel(config.getModel());
                if (config.getApi_key() != null && !config.getApi_key().trim().isEmpty()) {
                    safeConfig.setApi_key("");
                } else {
                    safeConfig.setApi_key("");
                }
                return ApiResponse.success(safeConfig);
            } else {
                return ApiResponse.success(new LlmConfig());
            }
        } catch (Exception e) {
            log.error("获取LLM配置信息失败", e);
            return ApiResponse.error(500, "获取LLM配置信息失败");
        }
    }

    @PostMapping("/config")
    @RequiresPermission("system:config:management")
    public ApiResponse<Void> updateLlmConfig(@RequestBody LlmConfig llmConfig) {
        log.info("更新LLM配置信息");
        try {
            if (llmConfig.getApi_url() == null || llmConfig.getApi_url().trim().isEmpty()) {
                return ApiResponse.error(400, "API地址不能为空");
            }

            if (llmConfig.getModel() == null || llmConfig.getModel().trim().isEmpty()) {
                return ApiResponse.error(400, "模型名称不能为空");
            }

            if (llmConfig.getApi_key() == null || llmConfig.getApi_key().trim().isEmpty()) {
                LlmConfig existingConfig = llmConfigService.getLlmConfig();
                if (existingConfig != null && existingConfig.getApi_key() != null) {
                    llmConfig.setApi_key(existingConfig.getApi_key());
                } else {
                    return ApiResponse.error(400, "首次配置时API密钥不能为空");
                }
            }

            boolean result = llmConfigService.updateLlmConfig(llmConfig);

            if (result) {
                return ApiResponse.success("LLM配置更新成功");
            } else {
                return ApiResponse.error(500, "更新LLM配置失败");
            }
        } catch (Exception e) {
            log.error("更新LLM配置信息失败", e);
            return ApiResponse.error(500, "更新LLM配置失败");
        }
    }
}
