package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import xyz.lingview.dimstack.domain.Permission;
import xyz.lingview.dimstack.domain.Role;

import java.util.List;

@Mapper
public interface RoleMapper {
    // 查询所有角色
    List<Role> selectAllRoles();
    
    // 根据id查询角色
    Role selectRoleById(@Param("id") Integer id);
    
    // 根据编码查询角色
    Role selectRoleByCode(@Param("code") String code);
    
    // 创建新角色
    int insertRole(Role role);
    
    // 更新角色信息
    int updateRole(Role role);
    
    // 删除角色
    int deleteRole(@Param("id") Integer id);
    
    // 为角色添加权限
    int insertRolePermission(@Param("roleId") Integer roleId, @Param("permissionId") Integer permissionId);
    
    // 移除角色权限
    int deleteRolePermission(@Param("roleId") Integer roleId, @Param("permissionId") Integer permissionId);
    
    // 获取角色的所有权限id
    List<Integer> selectPermissionIdsByRoleId(@Param("roleId") Integer roleId);
    
    // 获取角色的所有权限码
    List<String> selectPermissionCodesByRoleId(@Param("roleId") Integer roleId);
    
    // 根据权限码获取权限id
    Integer selectPermissionIdByCode(@Param("code") String code);
    
    // 插入新权限
    int insertPermission(Permission permission);
    
    // 查询所有权限列表
    List<Permission> selectAllPermissions();
}
