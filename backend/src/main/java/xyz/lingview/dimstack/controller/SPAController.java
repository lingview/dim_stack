package xyz.lingview.dimstack.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SPAController {

    @GetMapping({
        "/",
        "/login",
        "/register",
        "/dashboard",
        "/dashboard/**",
        "/article/**",
        "/category/**",
        "/about"
    })
    public String frontendRoutes() {
        return "forward:/index.html";
    }
}
