package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.Permission;
import xyz.lingview.dimstack.domain.Role;

import java.util.List;

public interface RoleService {
    // 获取所有角色列表
    List<Role> getAllRoles();
    
    // 根据id获取角色详情
    Role getRoleById(Integer id);
    
    // 创建新角色
    ApiResponse<Role> createRole(Role role);
    
    // 更新角色信息
    ApiResponse<Void> updateRole(Role role);
    
    // 删除角色
    ApiResponse<Void> deleteRole(Integer id);
    
    // 为角色添加权限（通过权限码）
    ApiResponse<Void> addPermissionToRole(Integer roleId, String permissionCode);
    
    // 从角色移除权限（通过权限码）
    ApiResponse<Void> removePermissionFromRole(Integer roleId, String permissionCode);
    
    // 获取角色的所有权限码
    List<String> getPermissionCodesByRoleId(Integer roleId);
    
    // 创建新权限
    ApiResponse<Permission> createPermission(Permission permission);
}
