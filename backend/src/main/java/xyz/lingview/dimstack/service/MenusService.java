package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.Menus;
import xyz.lingview.dimstack.dto.MenusDTO;
import java.util.List;

public interface MenusService {
    List<MenusDTO> getAllMenus();
    void addMenus(Menus menus, String username);
    void updateMenus(Menus menus, String username);
    void deleteMenus(String menusId);
}
