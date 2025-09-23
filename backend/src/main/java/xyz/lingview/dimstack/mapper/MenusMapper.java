package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import xyz.lingview.dimstack.domain.Menus;
import xyz.lingview.dimstack.dto.request.MenusDTO;
import java.util.List;

@Mapper
public interface MenusMapper {
    List<MenusDTO> selectAllMenus();
    void insertMenus(Menus menus);
    void updateMenus(Menus menus);
    void deleteMenus(String menusId);
}
