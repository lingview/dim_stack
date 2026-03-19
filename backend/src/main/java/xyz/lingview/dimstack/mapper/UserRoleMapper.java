package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserRoleMapper {
    // 为用户添加角色
    int insertUserRole(@Param("userId") Integer userId, @Param("roleId") Integer roleId);
    
    // 移除用户的角色
    int deleteUserRole(@Param("userId") Integer userId, @Param("roleId") Integer roleId);
    
    // 获取用户的所有角色id
    List<Integer> selectRoleIdsByUserId(@Param("userId") Integer userId);
    
    // 获取用户的所有角色
    List<xyz.lingview.dimstack.domain.Role> selectRolesByUserId(@Param("userId") Integer userId);
    
    // 检查用户是否拥有某个角色
    int countUserRole(@Param("userId") Integer userId, @Param("roleId") Integer roleId);
}
