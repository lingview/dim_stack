package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.AttachmentManagementService;

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
    private UserInformationMapper userInformationMapper;

    /**
     * 分页查询所有附件（管理员接口，仅正常状态）
     */
    @GetMapping("/admin/page")
    @RequiresPermission("system:edit")
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
    @RequiresPermission("system:edit")
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
    @RequiresPermission("system:edit")
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
    @RequiresPermission("system:edit")
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
    @RequiresPermission("system:edit")
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
    @RequiresPermission("system:edit")
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
        HttpSession session = request.getSession(false);
        String username = (String) session.getAttribute("username");
        String uuid = userInformationMapper.selectUserUUID(username);

        Map<String, Object> result = attachmentManagementService.getPageByUuid(uuid, page, size);
        return ApiResponse.success(result);
    }

    /**
     * 基于UUID分页查询附件（用户接口，仅已删除状态，6小时内）
     */
    @GetMapping("/page-deleted-only")
    public ApiResponse<Map<String, Object>> getDeletedAttachmentsByUuidOnly(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        String username = (String) session.getAttribute("username");
        String uuid = userInformationMapper.selectUserUUID(username);

        Map<String, Object> result = attachmentManagementService.getDeletedPageByUuidOnly(uuid, page, size);
        return ApiResponse.success(result);
    }

    /**
     * 基于UUID分页查询附件（用户接口，包含最近删除的6小时内）
     */
    @GetMapping("/page-with-deleted")
    public ApiResponse<Map<String, Object>> getAttachmentsByUuidWithDeleted(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        String username = (String) session.getAttribute("username");
        String uuid = userInformationMapper.selectUserUUID(username);

        Map<String, Object> result = attachmentManagementService.getPageByUuidWithRecentDeleted(uuid, page, size);
        return ApiResponse.success(result);
    }

    /**
     * 删除附件（管理员接口）
     */
    @DeleteMapping("/admin/{attachmentId}")
    @RequiresPermission("system:edit")
    public ApiResponse<Void> deleteAttachmentAdmin(
            @PathVariable String attachmentId) {

        boolean success = attachmentManagementService.deleteAttachment(attachmentId);

        if (success) {
            return ApiResponse.success("删除成功");
        } else {
            return ApiResponse.error(400, "删除失败");
        }
    }

    /**
     * 撤销删除附件（管理员接口）
     */
    @PostMapping("/admin/{attachmentId}/restore")
    @RequiresPermission("system:edit")
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
    public ApiResponse<Void> deleteAttachment(
            @PathVariable String attachmentId,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        String username = (String) session.getAttribute("username");
        String userUuid = userInformationMapper.selectUserUUID(username);

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
    public ApiResponse<Void> restoreAttachment(
            @PathVariable String attachmentId,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        String username = (String) session.getAttribute("username");
        String userUuid = userInformationMapper.selectUserUUID(username);

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
}