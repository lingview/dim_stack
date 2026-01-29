package xyz.lingview.dimstack.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.domain.UpdateInfo;
import xyz.lingview.dimstack.dto.request.PerformUpdateRequestDTO;
import xyz.lingview.dimstack.service.UpdateService;
import tools.jackson.databind.ObjectMapper;
import xyz.lingview.dimstack.common.ApiResponse;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.HashMap;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2026/01/27 09:44:15
 * @Description: 更新控制器
 * @Version: 1.0
 */
@RestController
@RequestMapping("/api/update")
public class UpdateController {

    @Autowired
    private UpdateService updateService;

    // 检查更新接口
    @GetMapping("/check")
    @RequiresPermission("system:edit")
    public ApiResponse<Map<String, Object>> checkForUpdates() {

        Map<String, Object> response = new HashMap<>();
        String updateUrl = "https://update.apilinks.cn/dimstack.json";

        try {
            String currentVersion = updateService.getCurrentVersion();
            String updateInfoJson = updateService.fetchUpdateInfo(updateUrl);

            if (updateInfoJson == null || updateInfoJson.isEmpty()) {
                response.put("success", false);
                response.put("message", "无法获取更新信息");
                return ApiResponse.error(400, "无法获取更新信息", response);
            }
            // 解析更新信息
            ObjectMapper objectMapper = new ObjectMapper();
            UpdateInfo updateInfo = objectMapper.readValue(updateInfoJson, UpdateInfo.class);

            // 比较版本号
            boolean hasUpdate = updateService.isNewerVersion(currentVersion, updateInfo.getVersion());
            boolean isCompatible = updateService.isVersionCompatible(currentVersion, updateInfo.getMinCompatibleVersion());

            response.put("success", true);
            response.put("hasUpdate", hasUpdate);
            response.put("isCompatible", isCompatible);
            response.put("currentVersion", currentVersion);
            response.put("newVersion", updateInfo.getVersion());
            response.put("updateInfo", updateInfo);

            return ApiResponse.success(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "检查更新时发生错误: " + e.getMessage());
            return ApiResponse.error(500, "检查更新时发生错误: " + e.getMessage(), response);
        }
    }

    // 下载更新包接口
    @PostMapping("/download")
    @RequiresPermission("system:edit")
    public ApiResponse<Map<String, Object>> downloadUpdate() {

        Map<String, Object> response = new HashMap<>();
        String updateUrl = "https://update.lingview.xyz/dimstack.json";

        try {
            String updateInfoJson = updateService.fetchUpdateInfo(updateUrl);
            if (updateInfoJson == null || updateInfoJson.isEmpty()) {
                return ApiResponse.error(400, "无法获取更新信息", response);
            }

            ObjectMapper objectMapper = new ObjectMapper();
            UpdateInfo updateInfo = objectMapper.readValue(updateInfoJson, UpdateInfo.class);

            String downloadUrl = updateInfo.getDownloadUrl();
            String checksum = updateInfo.getChecksum();

            if (downloadUrl == null || downloadUrl.isEmpty()) {
                return ApiResponse.error(400, "更新信息中未包含下载地址", response);
            }

            if (checksum == null || checksum.isEmpty()) {
                return ApiResponse.error(400, "更新信息中未包含校验值", response);
            }

            String updateDir = System.getProperty("user.dir") + "/.update";
            Path dirPath = Path.of(updateDir);
            Files.createDirectories(dirPath);

            String targetJarPath = updateDir + "/dimstack_update.jar";
            boolean downloadSuccess = updateService.downloadNewJar(downloadUrl, targetJarPath);

            if (!downloadSuccess) {
                return ApiResponse.error(500, "下载失败", response);
            }

            Path checksumPath = Path.of(updateDir, "dimstack_update.sha256");
            Files.writeString(
                    checksumPath,
                    checksum.trim(),
                    StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING
            );

            response.put("success", true);
            response.put("message", "下载成功");
            response.put("targetPath", targetJarPath);
            response.put("checksumSaved", true);

            return ApiResponse.success(response);

        } catch (Exception e) {
            return ApiResponse.error(500, "下载更新时发生错误: " + e.getMessage(), response);
        }
    }


    // 执行更新接口
    @PostMapping("/perform")
    @RequiresPermission("system:edit")
    public ApiResponse<Map<String, Object>> performUpdate(
            @RequestBody PerformUpdateRequestDTO request
    ) {
        Map<String, Object> response = new HashMap<>();

        boolean restartAfterUpdate = request.isRestartAfterUpdate();

        try {
            String updateDir = System.getProperty("user.dir") + "/.update";
            String newJarPath = updateDir + "/dimstack_update.jar";

            String expectedChecksum = updateService.getExpectedChecksum();
            if (expectedChecksum != null) {
                if (!updateService.verifyChecksum(newJarPath, expectedChecksum)) {
                    return ApiResponse.error(400, "文件校验失败", response);
                }
            }

            boolean success = restartAfterUpdate
                    ? updateService.performUpdateAndRestart(newJarPath)
                    : updateService.performUpdateOnly(newJarPath);

            return ApiResponse.success(Map.of(
                    "success", true,
                    "message", restartAfterUpdate
                            ? "更新并重启成功"
                            : "更新成功，未重启"
            ));

        } catch (Exception e) {
            return ApiResponse.error(500, e.getMessage(), response);
        }
    }

}
