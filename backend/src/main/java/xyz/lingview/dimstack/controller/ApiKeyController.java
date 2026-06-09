package xyz.lingview.dimstack.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.dto.request.ApiKeyCreateRequestDTO;
import xyz.lingview.dimstack.dto.response.ApiKeyCreatedResponseDTO;
import xyz.lingview.dimstack.dto.response.ApiKeyResponseDTO;
import xyz.lingview.dimstack.service.ApiKeyService;
import xyz.lingview.dimstack.service.CurrentUserService;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/06/09 11:35:19
 * @Description: API Key 管理器（个人中心）
 * @Version: 1.0
 */
@RestController
@RequestMapping("/api/apikey")
@Slf4j
public class ApiKeyController {

    @Autowired
    private ApiKeyService apiKeyService;

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping("/list")
    public ApiResponse<List<ApiKeyResponseDTO>> listApiKeys() {
        String userId = currentUserService.getCurrentUserUuid();
        if (userId == null) {
            return ApiResponse.error(401, "用户未登录");
        }
        return ApiResponse.success(apiKeyService.listApiKeys(userId));
    }

    @PostMapping("/create")
    public ApiResponse<ApiKeyCreatedResponseDTO> createApiKey(@RequestBody @Valid ApiKeyCreateRequestDTO requestDTO) {
        String userId = currentUserService.getCurrentUserUuid();
        if (userId == null) {
            return ApiResponse.error(401, "用户未登录");
        }
        try {
            ApiKeyCreatedResponseDTO created = apiKeyService.createApiKey(userId, requestDTO.getDescription());
            return ApiResponse.success("API Key 创建成功，请妥善保存，该 Key 仅显示一次", created);
        } catch (Exception e) {
            log.error("创建 API Key 失败", e);
            return ApiResponse.error(500, "创建 API Key 失败");
        }
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Void> updateApiKeyStatus(@PathVariable Integer id,
                                                @RequestParam Integer status) {
        String userId = currentUserService.getCurrentUserUuid();
        if (userId == null) {
            return ApiResponse.error(401, "用户未登录");
        }
        boolean result = apiKeyService.updateApiKeyStatus(userId, id, status);
        if (result) {
            return ApiResponse.success(status == 1 ? "API Key 已启用" : "API Key 已禁用");
        }
        return ApiResponse.error(404, "未找到该 API Key");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteApiKey(@PathVariable Integer id) {
        String userId = currentUserService.getCurrentUserUuid();
        if (userId == null) {
            return ApiResponse.error(401, "用户未登录");
        }
        boolean result = apiKeyService.deleteApiKey(userId, id);
        if (result) {
            return ApiResponse.success("API Key 删除成功");
        }
        return ApiResponse.error(404, "未找到该 API Key");
    }
}
