package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.LlmPromptConfig;

public interface LlmPromptConfigService {
    
    LlmPromptConfig getPromptByName(String promptName);
    
    boolean updatePrompt(LlmPromptConfig config);
}
