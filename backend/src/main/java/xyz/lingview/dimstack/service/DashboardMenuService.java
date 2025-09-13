package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.dto.DashboardMenuDTO;

public interface DashboardMenuService {
    DashboardMenuDTO getDashboardMenus(String username);
}
