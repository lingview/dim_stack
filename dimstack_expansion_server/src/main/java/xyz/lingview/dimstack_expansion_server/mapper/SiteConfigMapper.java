package xyz.lingview.dimstack_expansion_server.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack_expansion_server.domain.SiteConfig;

@Mapper
@Repository
public interface SiteConfigMapper {

    // 查询注册用户默认角色代码
    int getRegisterUserPermission();

}
