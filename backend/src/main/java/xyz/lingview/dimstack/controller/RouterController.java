package xyz.lingview.dimstack.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RouterController {

    @GetMapping({
//        "/",
        "/login",
        "/register",
        "/dashboard",
        "/dashboard/**",
        "/article/**",
        "/category/**",
        "/tag/**",
        "/friend-links",
    })
    public String frontendRoutes() {
        return "forward:/index.html";
    }
}
