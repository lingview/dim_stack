package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.dto.UserUpdateDTO;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.UserService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private UserInformationMapper userInformationMapper;

    @GetMapping("/status")
    public Map<String, Object> getUserStatus(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        Boolean isLoggedIn = (Boolean) session.getAttribute("isLoggedIn");
        String username = (String) session.getAttribute("username");

        if (isLoggedIn != null && isLoggedIn && username != null) {
            response.put("loggedIn", true);
            response.put("username", username);
        } else {
            response.put("loggedIn", false);
            response.put("username", null);
        }

        return response;
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

}
