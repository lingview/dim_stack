package xyz.lingview.dimstack.service;

public interface UserPermissionCheckService {

    // 检查用户是否拥有所有指定权限
    boolean hasAllPermissions(String username, String[] permissions);

    // 检查用户是否拥有任意一个指定权限
    boolean hasAnyPermission(String username, String[] permissions);
}