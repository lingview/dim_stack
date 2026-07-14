package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.domain.Menus;
import xyz.lingview.dimstack.dto.request.MenusDTO;
import xyz.lingview.dimstack.service.CurrentUserService;
import xyz.lingview.dimstack.service.MenusService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api")
public class MenusController {

    @Autowired
    private MenusService menusService;

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping("/frontendgetmenus")
    public ApiResponse<List<MenusDTO>> frontendGetMenus() {
        return ApiResponse.success(menusService.getAllMenus());
    }

    @GetMapping("/getmenus")
    @RequiresPermission("system:menus:management")
    public ApiResponse<List<MenusDTO>> getMenus() {
        return ApiResponse.success(menusService.getAllMenus());
    }

    @PostMapping("/addmenus")
    @RequiresPermission("system:menus:management")
    public ApiResponse<String> addMenus(@RequestBody Menus menus) {
        String username = currentUserService.getCurrentUsername();
        if (username == null) {
            return ApiResponse.error(401, "用户未登录");
        }
        menusService.addMenus(menus, username);
        return ApiResponse.success("", "添加菜单成功");
    }

    @PostMapping("/editmenus")
    @RequiresPermission("system:menus:management")
    public ApiResponse<String> editMenus(@RequestBody Menus menus) {
        String username = currentUserService.getCurrentUsername();
        if (username == null) {
            return ApiResponse.error(401, "用户未登录");
        }
        menusService.updateMenus(menus, username);
        return ApiResponse.success("", "编辑菜单成功");
    }

    @PostMapping("/deletemenus")
    @RequiresPermission("system:menus:management")
    public ApiResponse<String> deleteMenus(@RequestParam String menus_id) {
        menusService.deleteMenus(menus_id);
        return ApiResponse.success("", "删除菜单成功");
    }

    @PostMapping("/updatesortorder")
    @RequiresPermission("system:menus:management")
    public ApiResponse<String> updateSortOrder(@RequestBody List<Menus> menusList) {
        menusService.updateSortOrder(menusList);
        return ApiResponse.success("", "更新排序成功");
    }
}