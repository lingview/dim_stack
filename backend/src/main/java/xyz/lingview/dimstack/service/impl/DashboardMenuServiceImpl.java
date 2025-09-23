package xyz.lingview.dimstack.service.impl;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.DashboardMenu;
import xyz.lingview.dimstack.dto.request.DashboardMenuDTO;
import xyz.lingview.dimstack.mapper.DashboardMenuMapper;
import xyz.lingview.dimstack.mapper.UserPermissionMapper;
import xyz.lingview.dimstack.service.DashboardMenuService;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardMenuServiceImpl implements DashboardMenuService {

    @Autowired
    private DashboardMenuMapper dashboardMenuMapper;

    @Autowired
    private UserPermissionMapper userPermissionMapper;

    @Override
    public DashboardMenuDTO getDashboardMenus(String username) {
        DashboardMenuDTO responseDTO = new DashboardMenuDTO();

        List<String> userPermissions = userPermissionMapper.findPermissionCodesByUserName(username);
        userPermissions.add(null);

        List<DashboardMenu> allMenus = dashboardMenuMapper.findAll();

        List<DashboardMenu> accessibleMenus = allMenus.stream()
                .filter(menu -> userPermissions.contains(menu.getPermission_code()))
                .collect(Collectors.toList());

        List<DashboardMenuDTO> sidebarMenu = buildMenuTree(accessibleMenus, "sidebar", null);
        responseDTO.setSidebarMenu(sidebarMenu);

        List<DashboardMenuDTO> quickActions = buildMenuTree(accessibleMenus, "quick_action", null);
        responseDTO.setQuickActions(quickActions);

        return responseDTO;
    }


    private List<DashboardMenuDTO> buildMenuTree(List<DashboardMenu> menus, String type, Integer parentId) {
        return menus.stream()
                .filter(menu -> type.equals(menu.getType()) &&
                               Objects.equals(parentId, menu.getParent_id()))
                .sorted(Comparator.comparing(DashboardMenu::getSort_order))
                .map(menu -> {
                    DashboardMenuDTO dto = new DashboardMenuDTO();
                    BeanUtils.copyProperties(menu, dto);

                    if (menu.getParent_id() == null) {
                        List<DashboardMenuDTO> children = buildMenuTree(menus, type, menu.getId());
                        if (!children.isEmpty()) {
                            dto.setChildren(children);
                        }
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }
}
