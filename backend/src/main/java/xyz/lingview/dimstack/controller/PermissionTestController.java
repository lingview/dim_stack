//package xyz.lingview.dimstack.controller;
//
//import xyz.lingview.dimstack.annotation.RequiresPermission;
//import org.springframework.web.bind.annotation.*;
//import jakarta.servlet.http.HttpSession;
//import java.util.HashMap;
//import java.util.Map;
//
//// 此接口文件为测试文件
//@RestController
//@RequestMapping("/api/test/permission")
//public class PermissionTestController {
//
//    // 测试查看文章权限
//    @GetMapping("/view")
//    @RequiresPermission("post:view")
//    public Map<String, Object> testViewPermission(HttpSession session) {
//        return createResponse(session, "post:view", "查看文章权限测试");
//    }
//
//    // 测试创建文章权限
//    @GetMapping("/create")
//    @RequiresPermission("post:create")
//    public Map<String, Object> testCreatePermission(HttpSession session) {
//        return createResponse(session, "post:create", "创建文章权限测试");
//    }
//
//    // 测试编辑自己文章权限
//    @GetMapping("/edit/own")
//    @RequiresPermission("post:edit:own")
//    public Map<String, Object> testEditOwnPermission(HttpSession session) {
//        return createResponse(session, "post:edit:own", "编辑自己文章权限测试");
//    }
//
//    // 测试编辑任何文章权限
//    @GetMapping("/edit/any")
//    @RequiresPermission("post:edit:any")
//    public Map<String, Object> testEditAnyPermission(HttpSession session) {
//        return createResponse(session, "post:edit:any", "编辑任何文章权限测试");
//    }
//
//    // 测试删除自己文章权限
//    @GetMapping("/delete/own")
//    @RequiresPermission("post:delete:own")
//    public Map<String, Object> testDeleteOwnPermission(HttpSession session) {
//        return createResponse(session, "post:delete:own", "删除自己文章权限测试");
//    }
//
//    // 测试删除任何文章权限
//    @GetMapping("/delete/any")
//    @RequiresPermission("post:delete:any")
//    public Map<String, Object> testDeleteAnyPermission(HttpSession session) {
//        return createResponse(session, "post:delete:any", "删除任何文章权限测试");
//    }
//
//    // 测试提交文章发布权限
//    @GetMapping("/submit")
//    @RequiresPermission("post:submit")
//    public Map<String, Object> testSubmitPermission(HttpSession session) {
//        return createResponse(session, "post:submit", "提交文章发布权限测试");
//    }
//
//    // 测试发布文章权限
//    @GetMapping("/publish")
//    @RequiresPermission("post:publish")
//    public Map<String, Object> testPublishPermission(HttpSession session) {
//        return createResponse(session, "post:publish", "发布文章权限测试");
//    }
//
//    // 测试审核文章权限
//    @GetMapping("/review")
//    @RequiresPermission("post:review")
//    public Map<String, Object> testReviewPermission(HttpSession session) {
//        return createResponse(session, "post:review", "审核文章权限测试");
//    }
//
//    // 测试需要多个权限（AND模式）
//    @GetMapping("/multi-and")
//    @RequiresPermission(value = {"post:view", "post:create"}, all = true)
//    public Map<String, Object> testMultiAndPermission(HttpSession session) {
//        return createResponse(session, "post:view & post:create", "多权限AND模式测试");
//    }
//
//    // 测试需要多个权限（OR模式）
//    @GetMapping("/multi-or")
//    @RequiresPermission(value = {"post:edit:own", "post:edit:any"}, all = false)
//    public Map<String, Object> testMultiOrPermission(HttpSession session) {
//        return createResponse(session, "post:edit:own | post:edit:any", "多权限OR模式测试");
//    }
//
//    // 测试无需特殊权限的接口
//    @GetMapping("/public")
//    public Map<String, Object> testPublicAccess(HttpSession session) {
//        return createResponse(session, "public", "公共访问接口测试");
//    }
//
//
//    private Map<String, Object> createResponse(HttpSession session, String permission, String description) {
//        Map<String, Object> response = new HashMap<>();
//        response.put("success", true);
//        response.put("message", "权限验证通过");
//        response.put("permission", permission);
//        response.put("description", description);
//        response.put("username", session.getAttribute("username"));
//        response.put("timestamp", System.currentTimeMillis());
//
//        System.out.println("=== 权限测试 ===");
//        System.out.println("用户: " + session.getAttribute("username"));
//        System.out.println("访问接口: " + description);
//        System.out.println("所需权限: " + permission);
//        System.out.println("时间: " + new java.util.Date());
//        System.out.println("===============");
//
//        return response;
//    }
//}
