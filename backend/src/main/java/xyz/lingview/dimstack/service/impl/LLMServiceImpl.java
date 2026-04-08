package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import xyz.lingview.dimstack.domain.LlmConfig;
import xyz.lingview.dimstack.domain.LlmPromptConfig;
import xyz.lingview.dimstack.enums.AiReviewResult;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.service.LLMService;
import xyz.lingview.dimstack.service.LlmConfigService;
import xyz.lingview.dimstack.service.LlmPromptConfigService;
import xyz.lingview.dimstack.util.LargeLanguageModelsUtil;

/**
 * @Author: lingview
 * @Date: 2026/04/08 17:18:31
 * @Description: 大模型调用服务实现
 * @Version: 1.0
 */
@Service
@Slf4j
public class LLMServiceImpl implements LLMService {

    @Autowired
    private LlmConfigService llmConfigService;

    @Autowired
    private LlmPromptConfigService llmPromptConfigService;

    @Autowired
    private CacheService cacheService;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public AiReviewResult reviewArticle(String articleContent) {
        try {
            LlmConfig llmConfig = llmConfigService.getLlmConfig();
            if (llmConfig == null || llmConfig.getApi_key() == null || llmConfig.getApi_key().trim().isEmpty()) {
                log.warn("LLM配置不存在或API密钥未配置，跳过审核");
                return AiReviewResult.ERROR;
            }

            LlmPromptConfig promptConfig = llmPromptConfigService.getPromptByName("article_review");
            if (promptConfig == null || promptConfig.getPrompt_content() == null || promptConfig.getPrompt_content().trim().isEmpty()) {
                log.warn("文章审核提示词不存在，跳过审核");
                return AiReviewResult.ERROR;
            }

            String systemContent = promptConfig.getPrompt_content();

            String response = LargeLanguageModelsUtil.callDashscopeAPI(
                    llmConfig.getApi_key(),
                    llmConfig.getApi_url(),
                    llmConfig.getModel(),
                    systemContent,
                    articleContent
            );

            Boolean result = parseReviewResult(response);
            if (result == null) {
                log.warn("AI审核结果不明确，转为人工审核");
                return AiReviewResult.ERROR;
            }
            return result ? AiReviewResult.PASS : AiReviewResult.REJECT;

        } catch (Exception e) {
            log.error("文章审核异常，转为人工审核", e);
            return AiReviewResult.ERROR;
        }
    }
    private Boolean parseReviewResult(String response) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);

            JsonNode choices = rootNode.get("choices");
            if (choices != null && choices.isArray() && choices.size() > 0) {
                JsonNode message = choices.get(0).get("message");
                if (message != null) {
                    String content = message.get("content").asText();

                    try {
                        JsonNode resultNode = objectMapper.readTree(content);
                        if (resultNode.has("compliant")) {
                            return resultNode.get("compliant").asBoolean();
                        }
                    } catch (Exception e) {
                        log.debug("响应内容不是JSON格式，尝试直接解析: {}", content);
                    }

                    String lowerContent = content.toLowerCase().trim();
                    if (lowerContent.contains("true") || lowerContent.contains("合规") || lowerContent.contains("通过")) {
                        return true;
                    } else if (lowerContent.contains("false") || lowerContent.contains("违规") || lowerContent.contains("不通过")) {
                        return false;
                    }
                }
            }
            
            log.warn("无法解析审核结果，需要人工审核: {}", response);
            return null;
            
        } catch (Exception e) {
            log.error("解析审核结果失败，需要人工审核", e);
            return null;
        }
    }
}
