package xyz.lingview.dimstack.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.Role;
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.dto.request.UserDTO;
import xyz.lingview.dimstack.dto.request.UserUpdateDTO;
import xyz.lingview.dimstack.dto.response.UserStatusResponseDTO;
import xyz.lingview.dimstack.service.UserService;
import xyz.lingview.dimstack.service.UserBlacklistService;
import xyz.lingview.dimstack.service.UserRoleService;
import xyz.lingview.dimstack.service.CurrentUserService;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private UserBlacklistService userBlacklistService;
    @Autowired
    private UserRoleService userRoleService;
    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping("/status")
    public ApiResponse<UserStatusResponseDTO> getUserStatus() {
        UserStatusResponseDTO responseDTO = new UserStatusResponseDTO();

        String username = currentUserService.getCurrentUsername();

        if (currentUserService.isAuthenticated() && username != null) {
            if (userBlacklistService.isUserInBlacklist(username)) {
                responseDTO.setLoggedIn(false);
                responseDTO.setUsername(null);
                responseDTO.setMessage("用户已被封禁");
                return ApiResponse.success(responseDTO);
            }

            responseDTO.setLoggedIn(true);
            responseDTO.setUsername(username);
            responseDTO.setAvatar(userService.getAvatarByUsername(username));
            responseDTO.setMessage("用户已登录");
        } else {
            responseDTO.setLoggedIn(false);
            responseDTO.setUsername(null);
            responseDTO.setMessage("用户未登录");
        }

        return ApiResponse.success(responseDTO);
    }


    @GetMapping("/has-permission")
    public ApiResponse<Map<String, Boolean>> hasPermission(
            @RequestParam List<String> codes,
            @RequestParam(defaultValue = "any") String mode) {
        String username = currentUserService.getCurrentUsername();
        if (!currentUserService.isAuthenticated() || username == null) {
            return ApiResponse.success(Map.of("hasPermission", false));
        }
        List<String> userPermissions = userService.getPermissionCodesByUsername(username);
        Set<String> userPermSet = new HashSet<>(userPermissions);
        boolean hasPermission;
        if ("all".equals(mode)) {
            hasPermission = userPermSet.containsAll(codes);
        } else {
            hasPermission = codes.stream().anyMatch(userPermSet::contains);
        }
        return ApiResponse.success(Map.of("hasPermission", hasPermission));
    }


    @GetMapping("/{uuid}")
    public ApiResponse<UserInformation> getUserInfo(@PathVariable String uuid) {
        UserInformation userInfo = userService.getUserByUUID(uuid);
        return ApiResponse.success(userInfo);
    }


    @PutMapping("/update")
    public ApiResponse<Void> updateUserInfo(@RequestBody @Valid UserUpdateDTO userUpdateDTO) {
        String currentUsername = currentUserService.getCurrentUsername();
        return userService.updateUserInfo(userUpdateDTO, currentUsername);
    }

    @GetMapping("/uuid")
    public ApiResponse<Map<String, String>> getUserIdByUsername(@RequestParam String username) {
        String userId = userService.getUserUUID(username);

        if (userId != null) {
            return ApiResponse.success(Map.of("username", username, "uuid", userId));
        } else {
            return ApiResponse.success(Map.of("username", username, "uuid", ""));
        }
    }


    @GetMapping("/list")
    @RequiresPermission("system:user:management")
    public ApiResponse<List<UserDTO>> getUserEnableList() {
        List<UserDTO> users = userService.getAllEnableUsers();
        return ApiResponse.success(users);
    }

    @GetMapping("/listall")
    @RequiresPermission("system:user:management")
    public ApiResponse<List<UserDTO>> getUserList() {
        List<UserDTO> users = userService.getAllUsers();
        return ApiResponse.success(users);
    }

    @GetMapping("/detail/{id}")
    @RequiresPermission("system:user:management")
    public ApiResponse<UserDTO> getUserDetail(@PathVariable Integer id) {
        UserDTO user = userService.getUserById(id);
        return ApiResponse.success(user);
    }

    @PostMapping("/updateRole")
    @RequiresPermission("system:user:management")
    public ApiResponse<String> updateUserRole(@RequestParam Integer userId, @RequestParam Integer roleId) {
        boolean result = userService.updateUserRole(userId, roleId);
        if (result) {
            return ApiResponse.success("", "success");
        } else {
            return ApiResponse.error(500, "更新角色失败");
        }
    }

    @PostMapping("/updateStatus")
    @RequiresPermission("system:user:management")
    public ApiResponse<String> updateUserStatus(@RequestParam Integer userId, @RequestParam Byte status) {
        boolean result = userService.updateUserStatus(userId, status);
        if (result) {
            return ApiResponse.success("", "success");
        } else {
            return ApiResponse.error(500, "更新状态失败");
        }
    }

    @GetMapping("/roles")
    @RequiresPermission("system:user:management")
    public ApiResponse<List<Role>> getAllRoles() {
        List<Role> roles = userService.getAllRoles();
        return ApiResponse.success(roles);
    }

    @GetMapping("/permissions/{userId}")
    @RequiresPermission("system:user:management")
    public ApiResponse<List<String>> getUserPermissions(@PathVariable Integer userId) {
        List<String> permissions = userService.getUserPermissions(userId);
        return ApiResponse.success(permissions);
    }


    @PostMapping("/add")
    @RequiresPermission("system:user:management")
    public ApiResponse<Void> addUser(@RequestBody UserUpdateDTO userUpdateDTO) {
        return userService.addUser(userUpdateDTO);
    }

    @PostMapping("/admin/update")
    @RequiresPermission("system:user:management")
    public ApiResponse<Void> updateUserByAdmin(@RequestBody UserUpdateDTO userUpdateDTO) {
        return userService.updateUserByAdmin(userUpdateDTO);
    }

    @GetMapping("/{userId}/roles")
    @RequiresPermission("system:user:management")
    public ApiResponse<List<xyz.lingview.dimstack.domain.Role>> getUserRoles(@PathVariable Integer userId) {
        List<xyz.lingview.dimstack.domain.Role> roles = userRoleService.getUserRoles(userId);
        return ApiResponse.success(roles);
    }
}