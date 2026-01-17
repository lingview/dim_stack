package xyz.lingview.dimstack.service.impl;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.CustomPage;
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.dto.request.CustomPageRequest;
import xyz.lingview.dimstack.dto.response.CustomPageResponse;
import xyz.lingview.dimstack.mapper.CustomPageMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.CustomPageService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @Author: lingview
 * @Date: 2026/01/17 20:13:35
 * @Description:
 * @Version: 1.0
 */
@Service
public class CustomPageServiceImpl implements CustomPageService {

    @Autowired
    private CustomPageMapper customPageMapper;

    @Autowired
    private UserInformationMapper userInformationMapper;

    @Override
    public ApiResponse<CustomPageResponse> createCustomPage(CustomPageRequest request, String userUuid) {
        // 检查别名是否已存在
        CustomPage existingPage = customPageMapper.selectByAlias(request.getAlias());
        if (existingPage != null) {
            return ApiResponse.error(400, "页面别名已存在");
        }

        CustomPage customPage = new CustomPage();
        BeanUtils.copyProperties(request, customPage);
        customPage.setUuid(userUuid);
        customPage.setCreateTime(LocalDateTime.now());
        customPage.setStatus(request.getStatus() != null ? request.getStatus() : 1);

        int result = customPageMapper.insert(customPage);
        if (result > 0) {
            CustomPageResponse response = convertToResponse(customPage);
            UserInformation userInfo = userInformationMapper.selectUserByUUID(userUuid);
            response.setCreatorUsername(userInfo != null ? userInfo.getUsername() : "");
            return ApiResponse.success(response);
        }
        return ApiResponse.error(500, "创建页面失败");
    }

    @Override
    public ApiResponse<CustomPageResponse> updateCustomPage(Integer id, CustomPageRequest request, String userUuid) {
        CustomPage existingPage = customPageMapper.selectByPrimaryKey(id);
        if (existingPage == null) {
            return ApiResponse.error(404, "页面不存在");
        }

        if (!existingPage.getUuid().equals(userUuid)) {
            return ApiResponse.error(403, "没有权限修改此页面");
        }

        if (!existingPage.getAlias().equals(request.getAlias())) {
            CustomPage aliasCheck = customPageMapper.selectByAlias(request.getAlias());
            if (aliasCheck != null && !aliasCheck.getId().equals(id)) {
                return ApiResponse.error(400, "页面别名已存在");
            }
        }

        CustomPage updatedPage = new CustomPage();
        BeanUtils.copyProperties(request, updatedPage);
        updatedPage.setId(id);
        updatedPage.setUuid(userUuid);
        updatedPage.setCreateTime(existingPage.getCreateTime());

        int result = customPageMapper.updateByPrimaryKey(updatedPage);
        if (result > 0) {
            CustomPageResponse response = convertToResponse(updatedPage);
            UserInformation userInfo = userInformationMapper.selectUserByUUID(userUuid);
            response.setCreatorUsername(userInfo != null ? userInfo.getUsername() : "");
            return ApiResponse.success(response);
        }
        return ApiResponse.error(500, "更新页面失败");
    }

    @Override
    public ApiResponse<Boolean> deleteCustomPage(Integer id, String userUuid) {
        CustomPage existingPage = customPageMapper.selectByPrimaryKey(id);
        if (existingPage == null) {
            return ApiResponse.error(404, "页面不存在", false);
        }

        if (!existingPage.getUuid().equals(userUuid)) {
            return ApiResponse.error(403, "没有权限删除此页面", false);
        }

        int result = customPageMapper.deleteByPrimaryKey(id);
        if (result > 0) {
            return ApiResponse.success(true);
        }
        return ApiResponse.error(500, "删除页面失败", false);
    }

    @Override
    public ApiResponse<CustomPageResponse> getCustomPageByAlias(String alias) {
        CustomPage customPage = customPageMapper.selectByAlias(alias);
        if (customPage == null) {
            return ApiResponse.error(404, "页面不存在");
        }

        CustomPageResponse response = convertToResponse(customPage);
        UserInformation userInfo = userInformationMapper.selectUserByUUID(customPage.getUuid());
        response.setCreatorUsername(userInfo != null ? userInfo.getUsername() : "");
        return ApiResponse.success(response);
    }

    @Override
    public ApiResponse<List<CustomPageResponse>> getCustomPagesByUser(String userUuid) {
        List<CustomPage> pages = customPageMapper.selectByUserId(userUuid);
        List<CustomPageResponse> responses = pages.stream()
                .map(page -> {
                    CustomPageResponse response = convertToResponse(page);
                    UserInformation userInfo = userInformationMapper.selectUserByUUID(page.getUuid());
                    response.setCreatorUsername(userInfo != null ? userInfo.getUsername() : "");
                    return response;
                })
                .collect(Collectors.toList());
        return ApiResponse.success(responses);
    }

    @Override
    public ApiResponse<List<CustomPageResponse>> getAllCustomPages() {
        List<CustomPage> pages = customPageMapper.selectAll();
        List<CustomPageResponse> responses = pages.stream()
                .map(page -> {
                    CustomPageResponse response = convertToResponse(page);
                    UserInformation userInfo = userInformationMapper.selectUserByUUID(page.getUuid());
                    response.setCreatorUsername(userInfo != null ? userInfo.getUsername() : "");
                    return response;
                })
                .collect(Collectors.toList());
        return ApiResponse.success(responses);
    }

    private CustomPageResponse convertToResponse(CustomPage customPage) {
        CustomPageResponse response = new CustomPageResponse();
        BeanUtils.copyProperties(customPage, response);
        return response;
    }
}
