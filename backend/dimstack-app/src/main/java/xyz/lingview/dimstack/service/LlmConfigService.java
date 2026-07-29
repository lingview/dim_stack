package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.LlmConfig;

public interface LlmConfigService {
    // 获取LLM配置
    LlmConfig getLlmConfig();

    // 更新LLM配置
    boolean updateLlmConfig(LlmConfig llmConfig);
}
