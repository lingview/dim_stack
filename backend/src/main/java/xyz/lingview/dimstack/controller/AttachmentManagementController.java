package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.service.AttachmentManagementService;
import xyz.lingview.dimstack.service.CurrentUserService;
import xyz.lingview.dimstack.service.UserService;

import java.util.List;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2026/02/08 17:40:00
 * @Description: 附件管理控制器
 * @Version: 1.0
 */
@RestController
@RequestMapping("/api/attachments")
public class AttachmentManagementController {

    @Autowired
    private AttachmentManagementService attachmentManagementService;

    @Autowired
    private UserService userService;

    @Autowired
    private CurrentUserService currentUserService;

    /**
     * 分页查询所有附件（管理员接口，仅正常状态）
     */
    @GetMapping("/admin/page")
    @RequiresPermission({"system:attachment:view", "system:attachment:management"})
    public ApiResponse<Map<String, Object>> getAttachments(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = attachmentManagementService.getPage(page, size);
        return ApiResponse.success(result);
    }

    /**
     * 分页查询所有附件（管理员接口，已删除状态，6小时内）
     */
    @GetMapping("/admin/page-deleted-only")
    @RequiresPermission({"system:attachment:view", "system:attachment:management"})
    public ApiResponse<Map<String, Object>> getDeletedAttachmentsOnly(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = attachmentManagementService.getDeletedPageOnly(page, size);
        return ApiResponse.success(result);
    }

    /**
     * 分页查询所有附件（管理员接口，包含最近删除的6小时内）
     */
    @GetMapping("/admin/page-with-deleted")
    @RequiresPermission({"system:attachment:view", "system:attachment:management"})
    public ApiResponse<Map<String, Object>> getAttachmentsWithDeleted(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = attachmentManagementService.getPageWithRecentDeleted(page, size);
        return ApiResponse.success(result);
    }

    /**
     * 根据用户UUID分页查询附件（管理员接口，正常状态）
     */
    @GetMapping("/admin/page-by-user")
    @RequiresPermission({"system:attachment:view", "system:attachment:management"})
    public ApiResponse<Map<String, Object>> getAttachmentsByUser(
            @RequestParam String userUuid,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = attachmentManagementService.getPageByUserUuid(userUuid, page, size);
        return ApiResponse.success(result);
    }

    /**
     * 根据用户UUID分页查询附件（管理员接口，包含删除状态）
     */
    @GetMapping("/admin/page-by-user-with-deleted")
    @RequiresPermission({"system:attachment:view", "system:attachment:management"})
    public ApiResponse<Map<String, Object>> getAttachmentsByUserWithDeleted(
            @RequestParam String userUuid,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = attachmentManagementService.getPageByUserUuidWithDeleted(userUuid, page, size);
        return ApiResponse.success(result);
    }

    /**
     * 根据用户UUID分页查询已删除附件（管理员接口，仅已删除状态，6小时内）
     */
    @GetMapping("/admin/page-deleted-only-by-user")
    @RequiresPermission({"system:attachment:view", "system:attachment:management"})
    public ApiResponse<Map<String, Object>> getDeletedAttachmentsByUserOnly(
            @RequestParam String userUuid,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = attachmentManagementService.getDeletedPageByUserUuidOnly(userUuid, page, size);
        return ApiResponse.success(result);
    }

    /**
     * 基于UUID分页查询附件（用户接口，仅正常状态）
     */
    @GetMapping("/page")
    public ApiResponse<Map<String, Object>> getAttachmentsByUuid(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        String username = currentUserService.getCurrentUsername();
        String uuid = userService.getUserUUID(username);

        Map<String, Object> result = attachmentManagementService.getPageByUuid(uuid, page, size);
        return ApiResponse.success(result);
    }

    /**
     * 基于UUID分页查询附件（用户接口，仅已删除状态，6小时内）
     */
    @GetMapping("/page-deleted-only")
    @RequiresPermission({"attachment:view", "attachment:edit"})
    public ApiResponse<Map<String, Object>> getDeletedAttachmentsByUuidOnly(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        String username = currentUserService.getCurrentUsername();
        String uuid = userService.getUserUUID(username);

        Map<String, Object> result = attachmentManagementService.getDeletedPageByUuidOnly(uuid, page, size);
        return ApiResponse.success(result);
    }

    /**
     * 基于UUID分页查询附件（用户接口，包含最近删除的6小时内）
     */
    @GetMapping("/page-with-deleted")
    @RequiresPermission({"attachment:view", "attachment:edit"})
    public ApiResponse<Map<String, Object>> getAttachmentsByUuidWithDeleted(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        String username = currentUserService.getCurrentUsername();
        String uuid = userService.getUserUUID(username);

        Map<String, Object> result = attachmentManagementService.getPageByUuidWithRecentDeleted(uuid, page, size);
        return ApiResponse.success(result);
    }

    /**
     * 删除附件（管理员接口）
     */
    @DeleteMapping("/admin/{attachmentId}")
    @RequiresPermission({"system:attachment:delete", "system:attachment:management"})
    public ApiResponse<Void> deleteAttachmentAdmin(
            @PathVariable String attachmentId) {

        boolean success = attachmentManagementService.deleteAttachment(attachmentId);

        if (success) {
            return ApiResponse.success("删除成功");
        } else {
            return ApiResponse.error(400, "删除失败");
        }
    }

    // 管理员批量删除附件
    @PostMapping("/admin/batch-delete")
    @RequiresPermission({"system:attachment:delete", "system:attachment:management"})
    public ApiResponse<Integer> batchDeleteAttachmentAdmin(@RequestBody List<String> attachmentIds) {
        if (attachmentIds == null || attachmentIds.isEmpty()) {
            return ApiResponse.error(400, "请选择要删除的附件");
        }

        int count = attachmentManagementService.batchDeleteAttachments(attachmentIds);
        return ApiResponse.success("成功删除 " + count + " 个附件", count);
    }

    // 管理员批量撤销删除附件
    @PostMapping("/admin/batch-restore")
    @RequiresPermission({"system:attachment:undelete", "system:attachment:management"})
    public ApiResponse<Integer> batchRestoreAttachmentAdmin(@RequestBody List<String> attachmentIds) {
        if (attachmentIds == null || attachmentIds.isEmpty()) {
            return ApiResponse.error(400, "请选择要撤销的附件");
        }

        int count = attachmentManagementService.batchRestoreAttachments(attachmentIds);
        return ApiResponse.success("成功撤销 " + count + " 个附件", count);
    }

    // 管理员批量彻底删除附件
    @PostMapping("/admin/batch-physically-delete")
    @RequiresPermission({"system:attachment:delete", "system:attachment:management"})
    public ApiResponse<Integer> batchPhysicallyDeleteAttachmentAdmin(@RequestBody List<String> attachmentIds) {
        if (attachmentIds == null || attachmentIds.isEmpty()) {
            return ApiResponse.error(400, "请选择要彻底删除的附件");
        }

        int count = attachmentManagementService.batchPhysicallyDeleteAttachments(attachmentIds);
        return ApiResponse.success("成功彻底删除 " + count + " 个附件", count);
    }

    /**
     * 撤销删除附件（管理员接口）
     */
    @PostMapping("/admin/{attachmentId}/restore")
    @RequiresPermission({"system:attachment:undelete", "system:attachment:management"})
    public ApiResponse<Void> restoreAttachmentAdmin(
            @PathVariable String attachmentId) {

        boolean success = attachmentManagementService.restoreAttachment(attachmentId);
        if (success) {
            return ApiResponse.success("撤销删除成功");
        } else {
            return ApiResponse.error(400, "撤销删除失败");
        }
    }

    /**
     * 普通用户删除附件接口
     */
    @DeleteMapping("/{attachmentId}")
    @RequiresPermission({"attachment:delete", "attachment:edit"})
    public ApiResponse<Void> deleteAttachment(
            @PathVariable String attachmentId,
            HttpServletRequest request) {

        String username = currentUserService.getCurrentUsername();
        String userUuid = userService.getUserUUID(username);

        String attachmentOwnerUuid = attachmentManagementService.getAttachmentOwnerUuid(attachmentId);
        if (attachmentOwnerUuid == null) {
            return ApiResponse.error(400, "附件不存在");
        }

        if (!attachmentOwnerUuid.equals(userUuid)) {
            return ApiResponse.error(403, "无权限删除此附件");
        }

        boolean success = attachmentManagementService.deleteAttachment(attachmentId);
        if (success) {
            return ApiResponse.success("删除成功");
        } else {
            return ApiResponse.error(400, "删除失败");
        }
    }

    /**
     * 普通用户撤销删除附件接口
     */
    @PostMapping("/{attachmentId}/restore")
    @RequiresPermission({"attachment:undelete", "attachment:edit"})
    public ApiResponse<Void> restoreAttachment(
            @PathVariable String attachmentId,
            HttpServletRequest request) {

        String username = currentUserService.getCurrentUsername();
        String userUuid = userService.getUserUUID(username);

        String attachmentOwnerUuid = attachmentManagementService.getAttachmentOwnerUuid(attachmentId);
        if (attachmentOwnerUuid == null) {
            return ApiResponse.error(400, "附件不存在");
        }

        if (!attachmentOwnerUuid.equals(userUuid)) {
            return ApiResponse.error(403, "无权限操作此附件");
        }
        boolean success = attachmentManagementService.restoreAttachment(attachmentId);
        if (success) {
            return ApiResponse.success("撤销删除成功");
        } else {
            return ApiResponse.error(400, "撤销删除失败");
        }
    }

    @PostMapping("/admin/{attachmentId}/physically-delete")
    @RequiresPermission({"system:attachment:delete", "system:attachment:management"})
    public ApiResponse<Void> physicallyDeleteAttachmentAdmin(
            @PathVariable String attachmentId) {
        boolean success = attachmentManagementService.physicallyDeleteAttachment(attachmentId);
        if (success) {
            return ApiResponse.success("彻底删除成功");
        } else {
            return ApiResponse.error(400, "彻底删除失败");
        }
    }

    @PostMapping("/{attachmentId}/physically-delete")
    @RequiresPermission({"attachment:delete", "attachment:edit"})
    public ApiResponse<Void> physicallyDeleteAttachment(
            @PathVariable String attachmentId,
            HttpServletRequest request) {

        String username = currentUserService.getCurrentUsername();
        String userUuid = userService.getUserUUID(username);

        String attachmentOwnerUuid = attachmentManagementService.getAttachmentOwnerUuid(attachmentId);
        if (attachmentOwnerUuid == null) {
            return ApiResponse.error(400, "附件不存在");
        }

        if (!attachmentOwnerUuid.equals(userUuid)) {
            return ApiResponse.error(403, "无权限操作此附件");
        }

        boolean success = attachmentManagementService.physicallyDeleteAttachment(attachmentId);
        if (success) {
            return ApiResponse.success("彻底删除成功");
        } else {
            return ApiResponse.error(400, "彻底删除失败");
        }
    }

    @PostMapping("/admin/migrate-storage")
    @RequiresPermission({"system:attachment:management"})
    public ApiResponse<Map<String, Object>> migrateStorage(@RequestBody Map<String, String> payload) {
        String sourceStorageId = payload.get("sourceStorageId");
        String targetStorageId = payload.get("targetStorageId");

        if (sourceStorageId == null || targetStorageId == null) {
            return ApiResponse.error(400, "源存储和目标存储不能为空");
        }
        if (sourceStorageId.equals(targetStorageId)) {
            return ApiResponse.error(400, "源存储和目标存储不能相同");
        }

        Map<String, Object> result = attachmentManagementService.migrateStorage(sourceStorageId, targetStorageId);
        return ApiResponse.success(result);
    }

    @PostMapping("/admin/migrate-storage/retry")
    @RequiresPermission({"system:attachment:management"})
    public ApiResponse<Map<String, Object>> retryMigrateStorage(@RequestBody Map<String, Object> payload) {
        String sourceStorageId = (String) payload.get("sourceStorageId");
        String targetStorageId = (String) payload.get("targetStorageId");
        @SuppressWarnings("unchecked")
        List<String> attachmentIds = (List<String>) payload.get("attachmentIds");

        if (sourceStorageId == null || targetStorageId == null || attachmentIds == null || attachmentIds.isEmpty()) {
            return ApiResponse.error(400, "参数不完整");
        }
        if (sourceStorageId.equals(targetStorageId)) {
            return ApiResponse.error(400, "源存储和目标存储不能相同");
        }

        Map<String, Object> result = attachmentManagementService.retryMigrateStorage(sourceStorageId, targetStorageId, attachmentIds);
        return ApiResponse.success(result);
    }
}