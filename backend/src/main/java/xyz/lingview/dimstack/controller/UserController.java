package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    @GetMapping("/user/status")
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
}
