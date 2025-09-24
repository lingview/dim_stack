package xyz.lingview.dimstack_expansion_server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack_expansion_server.mapper.UserPermissionMapper;

import java.util.Set;

@Service
public class UserPermissionCheckService {

    @Autowired
    private UserPermissionMapper userPermissionMapper;

    // 检查用户是否拥有所有指定权限
    public boolean hasAllPermissions(String username, String[] permissions) {
        Set<String> userPermissions = getUserPermissions(username);
        for (String permission : permissions) {
            if (!userPermissions.contains(permission)) {
                return false;
            }
        }
        return true;
    }

    // 检查用户是否拥有任意一个指定权限
    public boolean hasAnyPermission(String username, String[] permissions) {
        Set<String> userPermissions = getUserPermissions(username);
        for (String permission : permissions) {
            if (userPermissions.contains(permission)) {
                return true;
            }
        }
        return false;
    }


    private Set<String> getUserPermissions(String username) {
        return Set.copyOf(userPermissionMapper.findPermissionCodesByUserName(username));
    }


}
