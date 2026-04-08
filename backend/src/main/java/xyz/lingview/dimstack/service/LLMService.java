package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.enums.AiReviewResult;

/**
 * @Author: lingview
 * @Date: 2026/04/08 17:14:04
 * @Description: 大模型调用服务
 * @Version: 1.0
 */
public interface LLMService {

    // 审核文章内容
    AiReviewResult reviewArticle(String articleContent);
}
