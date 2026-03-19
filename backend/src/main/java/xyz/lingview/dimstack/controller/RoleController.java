package xyz.lingview.dimstack.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.Permission;
import xyz.lingview.dimstack.domain.Role;
import xyz.lingview.dimstack.mapper.RoleMapper;
import xyz.lingview.dimstack.service.RoleService;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @Autowired
    private RoleMapper roleMapper;

    // 获取所有角色
    @GetMapping("/role/list")
    @RequiresPermission("user:management")
    public ApiResponse<List<Role>> getAllRoles() {
        List<Role> roles = roleService.getAllRoles();
        return ApiResponse.success(roles);
    }

    // 获取所有权限列表
    @GetMapping("/permission/list")
    @RequiresPermission("user:management")
    public ApiResponse<List<Permission>> getAllPermissions() {
        List<Permission> permissions = roleMapper.selectAllPermissions();
        return ApiResponse.success(permissions);
    }

    // 根据id获取角色详情
    @GetMapping("/role/{id}")
    @RequiresPermission("user:management")
    public ApiResponse<Role> getRoleById(@PathVariable Integer id) {
        Role role = roleService.getRoleById(id);
        if (role == null) {
            return ApiResponse.error(404, "角色不存在");
        }
        return ApiResponse.success(role);
    }

    // 创建新角色
    @PostMapping("/role/create")
    @RequiresPermission("user:management")
    public ApiResponse<Role> createRole(@RequestBody Role role) {
        return roleService.createRole(role);
    }

    // 更新角色信息
    @PutMapping("/role/update")
    @RequiresPermission("user:management")
    public ApiResponse<Void> updateRole(@RequestBody Role role) {
        return roleService.updateRole(role);
    }

    // 删除角色
    @DeleteMapping("/role/delete/{id}")
    @RequiresPermission("user:management")
    public ApiResponse<Void> deleteRole(@PathVariable Integer id) {
        return roleService.deleteRole(id);
    }

    // 为角色添加权限（通过权限码）
    @PostMapping("/role/{roleId}/permission/add")
    @RequiresPermission("user:management")
    public ApiResponse<Void> addPermissionToRole(@PathVariable Integer roleId, 
                                                  @RequestParam String permissionCode) {
        return roleService.addPermissionToRole(roleId, permissionCode);
    }

    // 从角色移除权限（通过权限码）
    @DeleteMapping("/role/{roleId}/permission/remove")
    @RequiresPermission("user:management")
    public ApiResponse<Void> removePermissionFromRole(@PathVariable Integer roleId, 
                                                       @RequestParam String permissionCode) {
        return roleService.removePermissionFromRole(roleId, permissionCode);
    }

    // 获取角色的所有权限码
    @GetMapping("/role/{roleId}/permissions")
    @RequiresPermission("user:management")
    public ApiResponse<List<String>> getPermissionCodesByRoleId(@PathVariable Integer roleId) {
        List<String> permissionCodes = roleService.getPermissionCodesByRoleId(roleId);
        return ApiResponse.success(permissionCodes);
    }

    // 创建新权限
    @PostMapping("/role/permission/create")
    @RequiresPermission("user:management")
    public ApiResponse<Permission> createPermission(@RequestBody Permission permission) {
        return roleService.createPermission(permission);
    }
}
