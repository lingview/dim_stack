package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.Role;

import java.util.List;

public interface UserRoleService {
    // 获取用户的所有角色
    List<Role> getUserRoles(Integer userId);
    
    // 为用户添加角色
    ApiResponse<Void> addUserRole(Integer userId, Integer roleId);
    
    // 从用户移除角色
    ApiResponse<Void> removeUserRole(Integer userId, Integer roleId);
    
    // 设置用户的角色
    ApiResponse<Void> setUserRoles(Integer userId, List<Integer> roleIds);
}
