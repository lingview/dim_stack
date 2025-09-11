package xyz.lingview.dimstack.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.Menus;
import xyz.lingview.dimstack.dto.MenusDTO;
import xyz.lingview.dimstack.mapper.MenusMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.MenusService;

import java.util.List;
import java.util.UUID;

@Service
public class MenusServiceImpl implements MenusService {

    @Autowired
    private MenusMapper menusMapper;

    @Autowired
    private UserInformationMapper userInformationMapper;

    @Override
    public List<MenusDTO> getAllMenus() {
        return menusMapper.selectAllMenus();
    }

    @Override
    public void addMenus(Menus menus, String username) {
        menus.setMenus_id("menu_" + UUID.randomUUID().toString().replace("-", ""));

        String userUuid = userInformationMapper.selectUserUUID(username);
        if (userUuid != null) {
            menus.setUser_id(userUuid);
        }

        menus.setStatus(1);

        menusMapper.insertMenus(menus);
    }

    @Override
    public void updateMenus(Menus menus, String username) {
        String userUuid = userInformationMapper.selectUserUUID(username);
        if (userUuid != null) {
            menus.setUser_id(userUuid);
        }

        menusMapper.updateMenus(menus);
    }

    @Override
    public void deleteMenus(String menusId) {
        menusMapper.deleteMenus(menusId);
    }
}
