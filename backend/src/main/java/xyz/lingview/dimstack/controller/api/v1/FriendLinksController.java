package xyz.lingview.dimstack.controller.api.v1;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.dto.request.FriendLinksRequestDTO;
import xyz.lingview.dimstack.service.FriendLinksService;

import jakarta.validation.Valid;

import java.util.Map;
/**
 * @Author: lingview
 * @Date: 2025/12/04 19:52:09
 * @Description: 友链控制器
 * @Version: 1.0
 */
@RestController
@RequestMapping("/api/friend-links")
@Slf4j
public class FriendLinksController {

    @Autowired
    private FriendLinksService friendLinkService;


    @PostMapping("/apply")
    public ResponseEntity<Map<String, Object>> applyFriendLink(@RequestBody @Valid FriendLinksRequestDTO requestDTO) {
        try {
            log.info("收到友链申请: {}", requestDTO.getSiteName());
            boolean result = friendLinkService.applyFriendLink(requestDTO);

            if (result) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "友链申请已提交，等待管理员审核"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                                "success", false,
                                "message", "友链申请失败"
                        ));
            }
        } catch (Exception e) {
            log.error("友链申请失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "友链申请时发生错误: " + e.getMessage()
                    ));
        }
    }


//    @GetMapping("/approved")
//    public ResponseEntity<Map<String, Object>> getApprovedFriendLinks() {
//        try {
//            List<FriendLinks> friendLinks = friendLinkService.getApprovedFriendLinks();
//            return ResponseEntity.ok(Map.of(
//                    "success", true,
//                    "data", friendLinks
//            ));
//        } catch (Exception e) {
//            log.error("获取友链列表失败", e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Map.of(
//                            "success", false,
//                            "message", "获取友链列表失败: " + e.getMessage()
//                    ));
//        }
//    }


    @GetMapping("/approved/page")
    public ResponseEntity<Map<String, Object>> getApprovedFriendLinksByPage(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "12") Integer size) {
        try {
            Map<String, Object> result = friendLinkService.getFriendLinksByPage(page, size, 1);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", result
            ));
        } catch (Exception e) {
            log.error("获取友链列表失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "获取友链列表失败: " + e.getMessage()
                    ));
        }
    }



    @GetMapping
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> getFriendLinks(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer status) {
        try {
            Map<String, Object> result = friendLinkService.getFriendLinksByPage(page, size, status);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", result
            ));
        } catch (Exception e) {
            log.error("获取友链列表失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "获取友链列表失败: " + e.getMessage()
                    ));
        }
    }


    @PutMapping("/{id}/status")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> updateFriendLinkStatus(
            @PathVariable Integer id,
            @RequestParam Integer status) {
        try {
            boolean result = friendLinkService.updateFriendLinkStatus(id, status);
            if (result) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "友链状态更新成功"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "success", false,
                                "message", "未找到该友链"
                        ));
            }
        } catch (Exception e) {
            log.error("更新友链状态失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "更新友链状态失败: " + e.getMessage()
                    ));
        }
    }


    @DeleteMapping("/{id}")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> deleteFriendLink(@PathVariable Integer id) {
        try {
            boolean result = friendLinkService.deleteFriendLink(id);
            if (result) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "友链删除成功"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "success", false,
                                "message", "未找到该友链"
                        ));
            }
        } catch (Exception e) {
            log.error("删除友链失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "删除友链失败: " + e.getMessage()
                    ));
        }
    }

    @DeleteMapping("/{id}/permanent")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> deleteFriendLinkPermanent(@PathVariable Integer id) {
        try {
            boolean result = friendLinkService.deleteFriendLinkPermanent(id);
            if (result) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "友链彻底删除成功"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "success", false,
                                "message", "未找到该友链"
                        ));
            }
        } catch (Exception e) {
            log.error("彻底删除友链失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "彻底删除友链失败: " + e.getMessage()
                    ));
        }
    }

    // 友链后台编辑
    @PutMapping("/{id}")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> updateFriendLink(@PathVariable Integer id, @RequestBody @Valid FriendLinksRequestDTO requestDTO) {
        try {
            boolean result = friendLinkService.updateFriendLink(id, requestDTO);
            if (result) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "友链信息更新成功"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "success", false,
                                "message", "未找到该友链"
                        ));
            }
        } catch (Exception e) {
            log.error("更新友链失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "更新友链失败: " + e.getMessage()
                    ));
        }
    }

}
