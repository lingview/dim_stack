package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.dto.request.CustomPageRequest;
import xyz.lingview.dimstack.dto.response.CustomPageResponse;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/01/17 20:12:57
 * @Description:
 * @Version: 1.0
 */
public interface CustomPageService {
    ApiResponse<CustomPageResponse> createCustomPage(CustomPageRequest request, String userUuid);

    ApiResponse<CustomPageResponse> updateCustomPage(Integer id, CustomPageRequest request, String userUuid);

    ApiResponse<Boolean> deleteCustomPage(Integer id, String userUuid);

    ApiResponse<CustomPageResponse> getCustomPageByAlias(String alias);

    ApiResponse<List<CustomPageResponse>> getCustomPagesByUser(String userUuid);

    ApiResponse<List<CustomPageResponse>> getAllCustomPages();
}