package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.LlmConfig;
import xyz.lingview.dimstack.service.LlmConfigService;
import xyz.lingview.dimstack.util.LargeLanguageModelsUtil;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/llm")
@Slf4j
public class LlmConfigController {

    @Autowired
    private LlmConfigService llmConfigService;

    private static final ObjectMapper objectMapper = new ObjectMapper();

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

    @GetMapping("/test")
    @RequiresPermission("system:config:management")
    public ApiResponse<String> testConnection() {
        log.info("测试LLM连接");
        try {
            LlmConfig llmConfig = llmConfigService.getLlmConfig();
            if (llmConfig == null) {
                return ApiResponse.error(400, "请先保存LLM配置");
            }
            if (llmConfig.getApi_key() == null || llmConfig.getApi_key().trim().isEmpty()) {
                return ApiResponse.error(400, "API密钥未配置");
            }
            if (llmConfig.getApi_url() == null || llmConfig.getApi_url().trim().isEmpty()) {
                return ApiResponse.error(400, "API地址未配置");
            }
            if (llmConfig.getModel() == null || llmConfig.getModel().trim().isEmpty()) {
                return ApiResponse.error(400, "模型名称未配置");
            }

            String response = LargeLanguageModelsUtil.callOpenAICompatibleAPI(
                    llmConfig.getApi_key(),
                    llmConfig.getApi_url(),
                    llmConfig.getModel(),
                    "你是次元栈blog系统的辅助AI",
                    "你好"
            );

            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode choices = rootNode.get("choices");
            if (choices != null && choices.isArray() && choices.size() > 0) {
                JsonNode message = choices.get(0).get("message");
                if (message != null && message.get("content") != null) {
                    String content = message.get("content").asText();
                    String preview = content.length() > 100 ? content.substring(0, 100) + "..." : content;
                    log.info("LLM连接测试成功，响应预览: {}", preview);
                    return ApiResponse.success("连接成功", "连接成功："+preview);
                }
            }

            log.warn("LLM连接测试返回格式异常: {}", response);
            return ApiResponse.error(500, "连接成功但响应格式异常");
        } catch (Exception e) {
            log.error("LLM连接测试失败", e);
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.length() > 200) {
                errorMsg = errorMsg.substring(0, 200);
            }
            return ApiResponse.error(500, "连接失败: " + errorMsg);
        }
    }
}
