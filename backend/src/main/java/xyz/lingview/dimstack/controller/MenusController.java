package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.domain.Menus;
import xyz.lingview.dimstack.dto.request.MenusDTO;
import xyz.lingview.dimstack.service.MenusService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api")
public class MenusController {

    @Autowired
    private MenusService menusService;

    @Autowired
    private HttpSession httpSession;

    @GetMapping("/frontendgetmenus")
    public List<MenusDTO> frontendGetMenus() {
        return menusService.getAllMenus();
    }

    @GetMapping("/getmenus")
    @RequiresPermission("system:edit")
    public List<MenusDTO> getMenus() {
        return menusService.getAllMenus();
    }

    @PostMapping("/addmenus")
    @RequiresPermission("system:edit")
    public String addMenus(@RequestBody Menus menus) {
        String username = (String) httpSession.getAttribute("username");
        if (username == null) {
            return "用户未登录";
        }
        menusService.addMenus(menus, username);
        return "success";
    }

    @PostMapping("/editmenus")
    @RequiresPermission("system:edit")
    public String editMenus(@RequestBody Menus menus) {
        String username = (String) httpSession.getAttribute("username");
        if (username == null) {
            return "用户未登录";
        }
        menusService.updateMenus(menus, username);
        return "success";
    }

    @PostMapping("/deletemenus")
    @RequiresPermission("system:edit")
    public String deleteMenus(@RequestParam String menus_id) {
        menusService.deleteMenus(menus_id);
        return "success";
    }
}
