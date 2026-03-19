package xyz.lingview.dimstack.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.Role;
import xyz.lingview.dimstack.service.UserRoleService;

import java.util.List;

@RestController
@RequestMapping("/api/user-role")
@RequiresPermission("user:management")
public class UserRoleController {

    @Autowired
    private UserRoleService userRoleService;

    // 获取用户的所有角色
    @GetMapping("/{userId}/roles")
    public ApiResponse<List<Role>> getUserRoles(@PathVariable Integer userId) {
        List<Role> roles = userRoleService.getUserRoles(userId);
        return ApiResponse.success(roles);
    }

    // 为用户添加角色
    @PostMapping("/{userId}/role/add")
    public ApiResponse<Void> addUserRole(@PathVariable Integer userId, 
                                         @RequestParam Integer roleId) {
        return userRoleService.addUserRole(userId, roleId);
    }

    // 从用户移除角色
    @DeleteMapping("/{userId}/role/remove")
    public ApiResponse<Void> removeUserRole(@PathVariable Integer userId, 
                                            @RequestParam Integer roleId) {
        return userRoleService.removeUserRole(userId, roleId);
    }

    // 设置用户的角色（替换所有现有角色）
    @PostMapping("/{userId}/roles/set")
    public ApiResponse<Void> setUserRoles(@PathVariable Integer userId, 
                                          @RequestBody List<Integer> roleIds) {
        return userRoleService.setUserRoles(userId, roleIds);
    }
}
