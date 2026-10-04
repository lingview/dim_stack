package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import xyz.lingview.dimstack.domain.DashboardMenu;

import java.util.List;

@Mapper
public interface DashboardMenuMapper {
    // 根据类型查询菜单
    List<DashboardMenu> findByType(@Param("type") String type);

    // 根据父级id查询子菜单
    List<DashboardMenu> findByParentId(@Param("parent_id") Integer parentId);

    // 根据权限码查询菜单
    List<DashboardMenu> findByPermissionCode(@Param("permission_code") String permissionCode);

    // 查询所有菜单
    List<DashboardMenu> findAll();

    int insert(DashboardMenu menu);

    // 父菜单下最大排序号
    Integer selectMaxSortByParent(@Param("parent_id") Integer parentId);

    // 按路径前缀删除(插件卸载清理用)
    int deleteByLinkPrefix(@Param("linkPrefix") String linkPrefix);
}
