package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.StorageMethod;
import xyz.lingview.dimstack.service.CurrentUserService;
import xyz.lingview.dimstack.service.StorageMethodService;

import java.util.List;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2026/07/17 17:23:48
 * @Description: 存储方式管理控制器
 * @Version: 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/storage")
public class StorageMethodController {

    @Autowired
    private StorageMethodService storageMethodService;

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping("/list")
    @RequiresPermission("system:config:management")
    public ApiResponse<List<StorageMethod>> list() {
        return ApiResponse.success(storageMethodService.list());
    }

    @PostMapping("/add")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, String>> add(@RequestBody StorageMethod storageMethod) {
        String userUuid = currentUserService.getCurrentUserUuid();
        Map<String, String> result = storageMethodService.add(storageMethod, userUuid);
        if (result.containsKey("error")) {
            return ApiResponse.error(400, result.get("error"));
        }
        return ApiResponse.success(result);
    }

    @PostMapping("/edit")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, String>> edit(@RequestBody StorageMethod storageMethod) {
        Map<String, String> result = storageMethodService.edit(storageMethod);
        if (result.containsKey("error")) {
            return ApiResponse.error(400, result.get("error"));
        }
        return ApiResponse.success(result);
    }

    @PostMapping("/disable")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, String>> disable(@RequestBody Map<String, String> payload) {
        String uuid = payload.get("uuid");
        Map<String, String> result = storageMethodService.disable(uuid);
        if (result.containsKey("error")) {
            return ApiResponse.error(400, result.get("error"));
        }
        return ApiResponse.success(result);
    }

    @PostMapping("/enable")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, String>> enable(@RequestBody Map<String, String> payload) {
        String uuid = payload.get("uuid");
        Map<String, String> result = storageMethodService.enable(uuid);
        if (result.containsKey("error")) {
            return ApiResponse.error(400, result.get("error"));
        }
        return ApiResponse.success(result);
    }

    @PostMapping("/delete")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, String>> delete(@RequestBody Map<String, String> payload) {
        String uuid = payload.get("uuid");
        Map<String, String> result = storageMethodService.deletePhysical(uuid);
        if (result.containsKey("error")) {
            return ApiResponse.error(400, result.get("error"));
        }
        return ApiResponse.success(result);
    }

    @PostMapping("/set-default")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, String>> setDefault(@RequestBody Map<String, String> payload) {
        String uuid = payload.get("uuid");
        Map<String, String> result = storageMethodService.setDefault(uuid);
        if (result.containsKey("error")) {
            return ApiResponse.error(400, result.get("error"));
        }
        return ApiResponse.success(result);
    }
}