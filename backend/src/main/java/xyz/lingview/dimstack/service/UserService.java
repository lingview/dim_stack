package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.Role;
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.dto.request.UserDTO;
import xyz.lingview.dimstack.dto.request.UserUpdateDTO;

import java.util.List;

public interface UserService {
    UserInformation getUserByUUID(String uuid);
    boolean updateUserInfo(UserUpdateDTO userUpdateDTO);
    String getUserUUID(String username);

    // 获取所有用户列表
    List<UserDTO> getAllUsers();

    // 根据id获取用户详情
    UserDTO getUserById(Integer id);

    // 更新用户角色
    boolean updateUserRole(Integer userId, Integer roleId);

    // 更新用户状态
    boolean updateUserStatus(Integer userId, Byte status);

    // 获取所有角色列表
    List<Role> getAllRoles();

    // 根据用户id获取权限列表
    List<String> getUserPermissions(Integer userId);

    // 添加用户到黑名单
    void addUserToBlacklist(String username);

    // 从黑名单中移除用户
    void removeUserFromBlacklist(String username);

    // 密码验证方法
    boolean checkPassword(String plaintextPassword, String hashedPassword);

}
