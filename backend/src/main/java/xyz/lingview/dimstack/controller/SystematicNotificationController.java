package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.SystematicNotification;
import xyz.lingview.dimstack.dto.request.PageResult;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.NotificationService;

/**
 * @Author: lingview
 * @Date: 2026/01/31 12:52:01
 * @Description: 系统通知控制器
 * @Version: 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SystematicNotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserInformationMapper userInformationMapper;

    @GetMapping("/getsystematicNotification")
    public ApiResponse<PageResult<SystematicNotification>> getSystematicNotification(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            HttpSession session) {
        try {
            String username = (String) session.getAttribute("username");

            String uuid = userInformationMapper.selectUserUUID(username);
            PageResult<SystematicNotification> notifications =
                notificationService.getSystematicNotifications(uuid, pageNum, pageSize);
            return ApiResponse.success(notifications);
        } catch (Exception e) {
            log.error("获取系统通知失败", e);
            return ApiResponse.error(500, "获取系统通知失败");
        }
    }

    @GetMapping("/getReadNotifications")
    public ApiResponse<PageResult<SystematicNotification>> getReadNotifications(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            HttpSession session) {
        try {
            String username = (String) session.getAttribute("username");

            String uuid = userInformationMapper.selectUserUUID(username);
            PageResult<SystematicNotification> notifications =
                notificationService.getReadNotifications(uuid, pageNum, pageSize);
            return ApiResponse.success(notifications);
        } catch (Exception e) {
            log.error("获取已读通知失败", e);
            return ApiResponse.error(500, "获取已读通知失败");
        }
    }

    @GetMapping("/getUnreadNotifications")
    public ApiResponse<PageResult<SystematicNotification>> getUnreadNotifications(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            HttpSession session) {
        try {
            String username = (String) session.getAttribute("username");

            String uuid = userInformationMapper.selectUserUUID(username);
            PageResult<SystematicNotification> notifications =
                notificationService.getUnreadNotifications(uuid, pageNum, pageSize);
            return ApiResponse.success(notifications);
        } catch (Exception e) {
            log.error("获取未读通知失败", e);
            return ApiResponse.error(500, "获取未读通知失败");
        }
    }

    @PostMapping("/readSystematicNotification")
    public ApiResponse<Void> readSystematicNotification(
            @RequestParam Integer id,
            HttpSession session) {
        try {
            String username = (String) session.getAttribute("username");

            String uuid = userInformationMapper.selectUserUUID(username);
            boolean success = notificationService.updateNotificationStatus(id, uuid);
            if (success) {
                return ApiResponse.success("操作成功");
            } else {
                return ApiResponse.error(400, "操作失败或无权限");
            }
        } catch (Exception e) {
            log.error("设置通知为已读失败", e);
            return ApiResponse.error(500, "设置通知为已读失败");
        }
    }

    @PostMapping("/deleteSystematicNotification")
    public ApiResponse<Void> deleteSystematicNotification(
            @RequestParam Integer id,
            HttpSession session) {
        try {
            String username = (String) session.getAttribute("username");

            String uuid = userInformationMapper.selectUserUUID(username);
            boolean success = notificationService.deleteSystematicNotification(id, uuid);
            if (success) {
                return ApiResponse.success("删除成功");
            } else {
                return ApiResponse.error(400, "删除失败或无权限");
            }
        } catch (Exception e) {
            log.error("删除通知失败", e);
            return ApiResponse.error(500, "删除通知失败");
        }
    }
}
