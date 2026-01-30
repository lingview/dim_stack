package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.Role;
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.dto.request.UserDTO;
import xyz.lingview.dimstack.dto.request.UserUpdateDTO;
import xyz.lingview.dimstack.dto.response.UserStatusResponseDTO;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.UserService;
import xyz.lingview.dimstack.service.UserBlacklistService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private UserInformationMapper userInformationMapper;
    @Autowired
    private UserBlacklistService userBlacklistService;

    @GetMapping("/status")
    public ApiResponse<UserStatusResponseDTO> getUserStatus(HttpSession session) {
        UserStatusResponseDTO responseDTO = new UserStatusResponseDTO();

        Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
        String username = (String) session.getAttribute("username");

        if (isLoggedIn != null && isLoggedIn && username != null) {
            if (userBlacklistService.isUserInBlacklist(username)) {
                responseDTO.setLoggedIn(false);
                responseDTO.setUsername(null);
                responseDTO.setMessage("用户已被封禁");
                return ApiResponse.success(responseDTO);
            }

            responseDTO.setLoggedIn(true);
            responseDTO.setUsername(username);
            responseDTO.setAvatar(userInformationMapper.selectAvatarByUsername(username));
            responseDTO.setMessage("用户已登录");
        } else {
            responseDTO.setLoggedIn(false);
            responseDTO.setUsername(null);
            responseDTO.setMessage("用户未登录");
        }

        return ApiResponse.success(responseDTO);
    }


    @GetMapping("/{uuid}")
    public UserInformation getUserInfo(@PathVariable String uuid) {
        return userService.getUserByUUID(uuid);
    }


    @PutMapping("/update")
    public boolean updateUserInfo(@RequestBody UserUpdateDTO userUpdateDTO) {
        return userService.updateUserInfo(userUpdateDTO);
    }

    @GetMapping("/uuid")
    public Map<String, String> getUserIdByUsername(@RequestParam String username) {
        String user_id = userInformationMapper.selectUserUUID(username);

        if (user_id != null) {
            return Map.of("username", username, "uuid", user_id);
        } else {
            return Map.of("username", username, "uuid", "");
        }
    }


    @GetMapping("/list")
    @RequiresPermission("user:management")
    public List<UserDTO> getUserList() {
        return userService.getAllUsers();
    }

    @GetMapping("/detail/{id}")
    @RequiresPermission("user:management")
    public UserDTO getUserDetail(@PathVariable Integer id) {
        return userService.getUserById(id);
    }

    @PostMapping("/updateRole")
    @RequiresPermission("user:management")
    public String updateUserRole(@RequestParam Integer userId, @RequestParam Integer roleId) {
        boolean result = userService.updateUserRole(userId, roleId);
        if (result) {
            return "success";
        } else {
            return "更新角色失败";
        }
    }

    @PostMapping("/updateStatus")
    @RequiresPermission("user:management")
    public String updateUserStatus(@RequestParam Integer userId, @RequestParam Byte status) {
        boolean result = userService.updateUserStatus(userId, status);
        if (result) {
            return "success";
        } else {
            return "更新状态失败";
        }
    }

    @GetMapping("/roles")
    @RequiresPermission("user:management")
    public List<Role> getAllRoles() {
        return userService.getAllRoles();
    }

    @GetMapping("/permissions/{userId}")
    @RequiresPermission("user:management")
    public List<String> getUserPermissions(@PathVariable Integer userId) {
        return userService.getUserPermissions(userId);
    }


    @PostMapping("/add")
    @RequiresPermission("user:management")
    public ApiResponse<Void> addUser(@RequestBody UserUpdateDTO userUpdateDTO) {
        boolean result = userService.addUser(userUpdateDTO);
        if (result) {
            return ApiResponse.success("用户添加成功");
        } else {
            return ApiResponse.error(400, "添加用户失败，用户名可能已存在");
        }
    }

    @PostMapping("/admin/update")
    @RequiresPermission("user:management")
    public ApiResponse<Void> updateUserByAdmin(@RequestBody UserUpdateDTO userUpdateDTO) {
        boolean result = userService.updateUserByAdmin(userUpdateDTO);
        if (result) {
            return ApiResponse.success("用户信息更新成功");
        } else {
            return ApiResponse.error(400, "更新失败，可能是用户名已存在");
        }
    }
}
