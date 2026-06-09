package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.ApiKey;
import xyz.lingview.dimstack.dto.response.ApiKeyCreatedResponseDTO;
import xyz.lingview.dimstack.dto.response.ApiKeyResponseDTO;
import xyz.lingview.dimstack.mapper.ApiKeyMapper;
import xyz.lingview.dimstack.service.ApiKeyService;
import xyz.lingview.dimstack.util.ApiKeyUtil;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @Author: lingview
 * @Date: 2026/06/09 11:40:34
 * @Description: API Key 管理服务实现
 * @Version: 1.0
 */
@Service
@Slf4j
public class ApiKeyServiceImpl implements ApiKeyService {

    @Autowired
    private ApiKeyMapper apiKeyMapper;

    @Override
    public ApiKeyCreatedResponseDTO createApiKey(String userId, String description) {
        String plainKey;
        String keyHash;
        int attempt = 0;
        do {
            plainKey = ApiKeyUtil.generateApiKey();
            keyHash = ApiKeyUtil.sha256Hex(plainKey);
            attempt++;
        } while (apiKeyMapper.countByKeyHash(keyHash) > 0 && attempt < 5);

        ApiKey apiKey = new ApiKey();
        apiKey.setUser_id(userId);
        apiKey.setKey_hash(keyHash);
        apiKey.setDescription(description);
        apiKey.setStatus(1);

        int result = apiKeyMapper.insert(apiKey);
        if (result <= 0) {
            throw new IllegalStateException("API Key 创建失败");
        }

        return new ApiKeyCreatedResponseDTO(apiKey.getId(), description, plainKey);
    }

    @Override
    public List<ApiKeyResponseDTO> listApiKeys(String userId) {
        List<ApiKey> apiKeys = apiKeyMapper.selectByUserId(userId);
        return apiKeys.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public boolean updateApiKeyStatus(String userId, Integer id, Integer status) {
        if (status == null || (status != 0 && status != 1)) {
            return false;
        }
        return apiKeyMapper.updateStatusByIdAndUserId(id, userId, status) > 0;
    }

    @Override
    public boolean deleteApiKey(String userId, Integer id) {
        return apiKeyMapper.deleteByIdAndUserId(id, userId) > 0;
    }

    @Override
    public String validateAndGetUserId(String apiKey) {
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }
        String keyHash = ApiKeyUtil.sha256Hex(apiKey.trim());
        ApiKey record = apiKeyMapper.selectByKeyHash(keyHash);
        if (record == null || record.getStatus() == null || record.getStatus() != 1) {
            return null;
        }
        return record.getUser_id();
    }

    private ApiKeyResponseDTO toResponseDTO(ApiKey apiKey) {
        ApiKeyResponseDTO dto = new ApiKeyResponseDTO();
        dto.setId(apiKey.getId());
        dto.setDescription(apiKey.getDescription());
        dto.setCreateTime(apiKey.getCreate_time());
        dto.setUpdateTime(apiKey.getUpdate_time());
        dto.setStatus(apiKey.getStatus());
        return dto;
    }
}
