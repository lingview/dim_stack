package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.dto.request.DashboardMenuDTO;
import xyz.lingview.dimstack.service.CurrentUserService;
import xyz.lingview.dimstack.service.DashboardMenuService;

@RestController
@RequestMapping("/api/dashboard")
@Slf4j
public class DashboardController {

    @Autowired
    private DashboardMenuService dashboardMenuService;

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping("/menus")
    public ApiResponse<DashboardMenuDTO> getDashboardMenus() {
        try {
            String username = currentUserService.getCurrentUsername();

            DashboardMenuDTO menus = dashboardMenuService.getDashboardMenus(username);

            return ApiResponse.success(menus);
        } catch (Exception e) {
            log.error("获取仪表盘菜单失败", e);
            return ApiResponse.error(500, "获取仪表盘菜单失败: " + e.getMessage());
        }
    }
}
