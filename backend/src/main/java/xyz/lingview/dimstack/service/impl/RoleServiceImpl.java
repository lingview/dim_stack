package xyz.lingview.dimstack.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.Permission;
import xyz.lingview.dimstack.domain.Role;
import xyz.lingview.dimstack.mapper.RoleMapper;
import xyz.lingview.dimstack.service.RoleService;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Service
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleMapper roleMapper;

    @Override
    public List<Role> getAllRoles() {
        return roleMapper.selectAllRoles();
    }

    @Override
    public Role getRoleById(Integer id) {
        return roleMapper.selectRoleById(id);
    }

    @Override
    public ApiResponse<Role> createRole(Role role) {
        Role existingRole = roleMapper.selectRoleByCode(role.getCode());
        if (existingRole != null) {
            return ApiResponse.error(400, "角色编码已存在");
        }

        if (role.getStatus() == null) {
            role.setStatus((byte) 1);
        }

        int result = roleMapper.insertRole(role);
        if (result <= 0) {
            return ApiResponse.error(500, "创建角色失败");
        }

        return ApiResponse.success(role);
    }

    @Override
    public ApiResponse<Void> updateRole(Role role) {
        Role existingRole = roleMapper.selectRoleById(role.getId());
        if (existingRole == null) {
            return ApiResponse.error(404, "角色不存在");
        }

        if (role.getCode() != null && !role.getCode().equals(existingRole.getCode())) {
            Role duplicateRole = roleMapper.selectRoleByCode(role.getCode());
            if (duplicateRole != null) {
                return ApiResponse.error(400, "角色编码已存在");
            }
        }

        int result = roleMapper.updateRole(role);
        if (result <= 0) {
            return ApiResponse.error(500, "更新角色失败");
        }

        return ApiResponse.success("更新成功");
    }

    @Override
    public ApiResponse<Void> deleteRole(Integer id) {
        Role existingRole = roleMapper.selectRoleById(id);
        if (existingRole == null) {
            return ApiResponse.error(404, "角色不存在");
        }

        int result = roleMapper.deleteRole(id);
        if (result <= 0) {
            return ApiResponse.error(500, "删除角色失败");
        }

        return ApiResponse.success("删除成功");
    }

    @Override
    public ApiResponse<Void> addPermissionToRole(Integer roleId, String permissionCode) {
        Role role = roleMapper.selectRoleById(roleId);
        if (role == null) {
            return ApiResponse.error(404, "角色不存在");
        }

        Integer permissionId = roleMapper.selectPermissionIdByCode(permissionCode);
        
        if (permissionId == null) {
            Permission permission = new Permission();
            permission.setCode(permissionCode);
            permission.setName(permissionCode);
            permission.setModule("custom");
            permission.setCreate_time(new Timestamp(System.currentTimeMillis()));
            
            int insertResult = roleMapper.insertPermission(permission);
            if (insertResult <= 0) {
                return ApiResponse.error(500, "创建权限失败");
            }
            permissionId = permission.getId();
        }

        List<Integer> existingPermissionIds = roleMapper.selectPermissionIdsByRoleId(roleId);
        if (existingPermissionIds.contains(permissionId)) {
            return ApiResponse.error(400, "权限已存在");
        }

        int result = roleMapper.insertRolePermission(roleId, permissionId);
        if (result <= 0) {
            return ApiResponse.error(500, "添加权限失败");
        }

        return ApiResponse.success("添加权限成功");
    }

    @Override
    public ApiResponse<Void> removePermissionFromRole(Integer roleId, String permissionCode) {
        Role role = roleMapper.selectRoleById(roleId);
        if (role == null) {
            return ApiResponse.error(404, "角色不存在");
        }

        Integer permissionId = roleMapper.selectPermissionIdByCode(permissionCode);
        if (permissionId == null) {
            return ApiResponse.error(404, "权限不存在");
        }

        int result = roleMapper.deleteRolePermission(roleId, permissionId);
        if (result <= 0) {
            return ApiResponse.error(500, "移除权限失败");
        }

        return ApiResponse.success("移除权限成功");
    }

    @Override
    public List<String> getPermissionCodesByRoleId(Integer roleId) {
        return roleMapper.selectPermissionCodesByRoleId(roleId);
    }

    @Override
    public ApiResponse<Permission> createPermission(Permission permission) {
        Integer existingId = roleMapper.selectPermissionIdByCode(permission.getCode());
        if (existingId != null) {
            return ApiResponse.error(400, "权限编码已存在");
        }

        permission.setCreate_time(new Timestamp(System.currentTimeMillis()));
        
        int result = roleMapper.insertPermission(permission);
        if (result <= 0) {
            return ApiResponse.error(500, "创建权限失败");
        }

        return ApiResponse.success(permission);
    }
}
