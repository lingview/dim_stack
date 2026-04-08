package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import xyz.lingview.dimstack.domain.LlmPromptConfig;

@Mapper
public interface LlmPromptConfigMapper {
    
    LlmPromptConfig getPromptByName(String promptName);
    
    int updatePrompt(LlmPromptConfig config);
}
