package xyz.lingview.dimstack.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.Role;
import xyz.lingview.dimstack.mapper.UserRoleMapper;
import xyz.lingview.dimstack.service.UserRoleService;

import java.util.List;

@Service
public class UserRoleServiceImpl implements UserRoleService {

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Override
    public List<Role> getUserRoles(Integer userId) {
        return userRoleMapper.selectRolesByUserId(userId);
    }

    @Override
    @Transactional
    public ApiResponse<Void> addUserRole(Integer userId, Integer roleId) {
        // 检查用户是否已经拥有该角色
        int count = userRoleMapper.countUserRole(userId, roleId);
        if (count > 0) {
            return ApiResponse.error(400, "用户已拥有该角色");
        }

        int result = userRoleMapper.insertUserRole(userId, roleId);
        if (result <= 0) {
            return ApiResponse.error(500, "添加角色失败");
        }

        return ApiResponse.success("添加角色成功");
    }

    @Override
    @Transactional
    public ApiResponse<Void> removeUserRole(Integer userId, Integer roleId) {
        int result = userRoleMapper.deleteUserRole(userId, roleId);
        if (result <= 0) {
            return ApiResponse.error(500, "移除角色失败");
        }

        return ApiResponse.success("移除角色成功");
    }

    @Override
    @Transactional
    public ApiResponse<Void> setUserRoles(Integer userId, List<Integer> roleIds) {
        List<Integer> existingRoleIds = userRoleMapper.selectRoleIdsByUserId(userId);
        for (Integer existingRoleId : existingRoleIds) {
            userRoleMapper.deleteUserRole(userId, existingRoleId);
        }

        if (roleIds != null) {
            for (Integer roleId : roleIds) {
                int result = userRoleMapper.insertUserRole(userId, roleId);
                if (result <= 0) {
                    throw new RuntimeException("设置角色失败，角色 ID: " + roleId);
                }
            }
        }

        return ApiResponse.success("设置角色成功");
    }
}
