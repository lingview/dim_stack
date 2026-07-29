package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.dto.response.ApiKeyCreatedResponseDTO;
import xyz.lingview.dimstack.dto.response.ApiKeyResponseDTO;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/06/09 11:39:23
 * @Description: API Key 管理服务
 * @Version: 1.0
 */
public interface ApiKeyService {

    ApiKeyCreatedResponseDTO createApiKey(String userId, String description);

    List<ApiKeyResponseDTO> listApiKeys(String userId);

    boolean updateApiKeyStatus(String userId, Integer id, Integer status);

    boolean deleteApiKey(String userId, Integer id);

    String validateAndGetUserId(String apiKey);
}
