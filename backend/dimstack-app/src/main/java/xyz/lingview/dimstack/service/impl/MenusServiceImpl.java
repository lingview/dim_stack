package xyz.lingview.dimstack.service.impl;

import org.apache.ibatis.session.ExecutorType;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.Menus;
import xyz.lingview.dimstack.dto.request.MenusDTO;
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

    @Autowired
    private SqlSessionFactory sqlSessionFactory;

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

        if (menus.getSort_order() == null) {
            List<MenusDTO> allMenus = menusMapper.selectAllMenus();
            int maxOrder = allMenus.stream()
                    .mapToInt(menu -> menu.getSort_order() != null ? menu.getSort_order() : 0)
                    .max()
                    .orElse(0);
            menus.setSort_order(maxOrder + 1);
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

    @Override
    public void updateSortOrder(List<Menus> menusList) {
        try (SqlSession sqlSession = sqlSessionFactory.openSession(ExecutorType.BATCH)) {
            MenusMapper mapper = sqlSession.getMapper(MenusMapper.class);

            for (Menus menu : menusList) {
                mapper.updateSortOrder(menu);
            }

            sqlSession.commit();
        } catch (Exception e) {
            throw new RuntimeException("批次更新排序失敗", e);
        }
    }
}