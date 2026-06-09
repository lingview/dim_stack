package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.dto.request.DashboardMenuDTO;
import xyz.lingview.dimstack.service.CurrentUserService;
import xyz.lingview.dimstack.service.DashboardMenuService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@Slf4j
public class DashboardController {

    @Autowired
    private DashboardMenuService dashboardMenuService;

    @Autowired
    private CurrentUserService currentUserService;

    @GetMapping("/menus")
    public ResponseEntity<Map<String, Object>> getDashboardMenus() {
        try {
            String username = currentUserService.getCurrentUsername();

            DashboardMenuDTO menus = dashboardMenuService.getDashboardMenus(username);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", menus);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("获取仪表盘菜单失败", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "获取仪表盘菜单失败: " + e.getMessage()
            ));
        }
    }
}
