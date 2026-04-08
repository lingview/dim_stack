package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.LlmConfig;
import xyz.lingview.dimstack.mapper.LlmConfigMapper;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.service.LlmConfigService;

@Service
@Slf4j
public class LlmConfigServiceImpl implements LlmConfigService {

    @Autowired
    private LlmConfigMapper llmConfigMapper;

    @Autowired
    private CacheService cacheService;

    @Override
    public LlmConfig getLlmConfig() {
        try {
            LlmConfig llmConfig = cacheService.get("dimstack:llm_config", LlmConfig.class);
            if (llmConfig != null) {
                return llmConfig;
            }
        } catch (Exception e) {
            log.warn("从缓存读取LLM配置失败，回退到数据库查询", e);
        }
        return llmConfigMapper.getLlmConfig();
    }

    @Override
    public boolean updateLlmConfig(LlmConfig llmConfig) {
        try {
            LlmConfig existingConfig = llmConfigMapper.getLlmConfig();
            int result;
            
            if (existingConfig != null) {
                result = llmConfigMapper.updateLlmConfig(llmConfig);
            } else {
                result = llmConfigMapper.insertLlmConfig(llmConfig);
            }
            
            if (result > 0) {
                cacheService.set("dimstack:llm_config", llmConfig);
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("更新LLM配置失败", e);
            return false;
        }
    }
}
