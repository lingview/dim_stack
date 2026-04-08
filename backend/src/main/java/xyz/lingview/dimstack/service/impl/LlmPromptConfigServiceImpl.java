package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.LlmPromptConfig;
import xyz.lingview.dimstack.mapper.LlmPromptConfigMapper;
import xyz.lingview.dimstack.service.LlmPromptConfigService;

@Service
@Slf4j
public class LlmPromptConfigServiceImpl implements LlmPromptConfigService {

    @Autowired
    private LlmPromptConfigMapper llmPromptConfigMapper;

    @Override
    public LlmPromptConfig getPromptByName(String promptName) {
        try {
            return llmPromptConfigMapper.getPromptByName(promptName);
        } catch (Exception e) {
            log.error("获取提示词配置失败: {}", promptName, e);
            return null;
        }
    }

    @Override
    public boolean updatePrompt(LlmPromptConfig config) {
        try {
            int result = llmPromptConfigMapper.updatePrompt(config);
            return result > 0;
        } catch (Exception e) {
            log.error("更新提示词配置失败: {}", config.getPrompt_name(), e);
            return false;
        }
    }
}
