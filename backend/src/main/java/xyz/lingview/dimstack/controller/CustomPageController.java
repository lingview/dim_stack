package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.dto.request.CustomPageRequest;
import xyz.lingview.dimstack.dto.response.CustomPageResponse;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.CustomPageService;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/01/17 20:16:05
 * @Description: 自定义页面控制器
 * @Version: 1.0
 */
@RestController
@RequestMapping("/api/custom-pages")
public class CustomPageController {

    @Autowired
    private CustomPageService customPageService;

    @Autowired
    private UserInformationMapper userInformationMapper;

    /**
     * 创建自定义页面
     */
    @PostMapping
    @RequiresPermission("system:edit")
    public ApiResponse<CustomPageResponse> createCustomPage(
            @RequestBody CustomPageRequest request,
            HttpServletRequest httpRequest) {

        String userUuid = getCurrentUserUuid(httpRequest);
        if (userUuid == null) {
            return ApiResponse.error(401, "用户未登录");
        }

        return customPageService.createCustomPage(request, userUuid);
    }

    /**
     * 更新自定义页面
     */
    @PutMapping("/{id}")
    @RequiresPermission("system:edit")
    public ApiResponse<CustomPageResponse> updateCustomPage(
            @PathVariable Integer id,
            @RequestBody CustomPageRequest request,
            HttpServletRequest httpRequest) {

        String userUuid = getCurrentUserUuid(httpRequest);
        if (userUuid == null) {
            return ApiResponse.error(401, "用户未登录");
        }

        return customPageService.updateCustomPage(id, request, userUuid);
    }

    /**
     * 删除自定义页面
     */
    @DeleteMapping("/{id}")
    @RequiresPermission("system:edit")
    public ApiResponse<Boolean> deleteCustomPage(
            @PathVariable Integer id,
            HttpServletRequest httpRequest) {

        String userUuid = getCurrentUserUuid(httpRequest);
        if (userUuid == null) {
            return ApiResponse.error(401, "用户未登录", false);
        }

        return customPageService.deleteCustomPage(id, userUuid);
    }

    /**
     * 根据别名获取自定义页面
     */
    @GetMapping("/{alias}")
    public ApiResponse<CustomPageResponse> getCustomPageByAlias(@PathVariable String alias) {
        return customPageService.getCustomPageByAlias(alias);
    }

    /**
     * 获取用户的所有自定义页面
     */
    @GetMapping("/user")
    @RequiresPermission("system:edit")
    public ApiResponse<List<CustomPageResponse>> getCustomPagesByUser(HttpServletRequest httpRequest) {

        String userUuid = getCurrentUserUuid(httpRequest);
        if (userUuid == null) {
            return ApiResponse.error(401, "用户未登录", null);
        }

        return customPageService.getCustomPagesByUser(userUuid);
    }

    /**
     * 获取所有自定义页面
     */
    @GetMapping
    @RequiresPermission("system:edit")
    public ApiResponse<List<CustomPageResponse>> getAllCustomPages(HttpServletRequest httpRequest) {
        String userUuid = getCurrentUserUuid(httpRequest);
        if (userUuid == null) {
            return ApiResponse.error(401, "用户未登录", null);
        }
        return customPageService.getAllCustomPages();
    }

    /**
     * 从Session获取当前用户UUID
     */
    private String getCurrentUserUuid(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            String username = (String) session.getAttribute("username");
            if (username != null) {
                return userInformationMapper.selectUserUUID(username);
            }
        }
        return null;
    }
}