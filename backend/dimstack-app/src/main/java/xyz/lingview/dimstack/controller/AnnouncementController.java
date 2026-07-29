package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.Announcement;
import xyz.lingview.dimstack.service.AnnouncementService;

import java.util.Map;

@RestController
@RequestMapping("/api/announcement")
@Slf4j
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @GetMapping
    public ApiResponse<Announcement> getAnnouncement() {
        try {
            Announcement announcement = announcementService.getLatest();
            return ApiResponse.success(announcement);
        } catch (Exception e) {
            log.error("获取公告失败", e);
            return ApiResponse.error(500, "获取公告失败: " + e.getMessage());
        }
    }

    @PostMapping
    @RequiresPermission("system:announcement:management")
    public ApiResponse<Void> saveAnnouncement(@RequestBody Map<String, String> payload) {
        String content = payload.get("content");
        try {
            boolean success = announcementService.save(content != null ? content : "");
            if (success) {
                return ApiResponse.success("公告保存成功");
            } else {
                return ApiResponse.error(500, "公告保存失败");
            }
        } catch (Exception e) {
            log.error("保存公告失败", e);
            return ApiResponse.error(500, "保存公告失败: " + e.getMessage());
        }
    }
}
