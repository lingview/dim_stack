package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.LlmPromptConfig;
import xyz.lingview.dimstack.service.LlmPromptConfigService;

@RestController
@RequestMapping("/api/llm/prompt")
@Slf4j
public class LlmPromptConfigController {

    @Autowired
    private LlmPromptConfigService llmPromptConfigService;

    @GetMapping("/{promptName}")
    @RequiresPermission("system:config:management")
    public ApiResponse<LlmPromptConfig> getPrompt(@PathVariable String promptName) {
        log.info("获取提示词配置: {}", promptName);
        try {
            LlmPromptConfig config = llmPromptConfigService.getPromptByName(promptName);
            if (config != null) {
                return ApiResponse.success(config);
            } else {
                return ApiResponse.error(404, "提示词配置不存在");
            }
        } catch (Exception e) {
            log.error("获取提示词配置失败", e);
            return ApiResponse.error(500, "获取提示词配置失败");
        }
    }

    @PutMapping("/{promptName}")
    @RequiresPermission("system:config:management")
    public ApiResponse<Void> updatePrompt(@PathVariable String promptName, @RequestBody LlmPromptConfig config) {
        log.info("更新提示词配置: {}", promptName);
        try {
            if (config.getPrompt_content() == null || config.getPrompt_content().trim().isEmpty()) {
                return ApiResponse.error(400, "提示词内容不能为空");
            }

            config.setPrompt_name(promptName);
            boolean result = llmPromptConfigService.updatePrompt(config);

            if (result) {
                return ApiResponse.success("提示词更新成功");
            } else {
                return ApiResponse.error(500, "提示词更新失败");
            }
        } catch (Exception e) {
            log.error("更新提示词配置失败", e);
            return ApiResponse.error(500, "更新提示词配置失败");
        }
    }
}
