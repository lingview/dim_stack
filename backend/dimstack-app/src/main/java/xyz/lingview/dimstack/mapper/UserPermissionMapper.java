package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface UserPermissionMapper {
    // 根据用户名查询拥有的权限
    List<String> findPermissionCodesByUserName(@Param("username") String username);
}