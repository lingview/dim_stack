package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import xyz.lingview.dimstack.domain.PluginInfo;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/08/03 20:23:41
 * @Description: 插件数据访问
 * @Version: 1.0
 */
@Mapper
public interface PluginMapper {

    List<PluginInfo> selectAll();

    PluginInfo selectByName(String name);

    int insert(PluginInfo info);

    int updateEnabled(@Param("name") String name, @Param("enabled") boolean enabled);

    int updateInfo(PluginInfo info);

    int deleteByName(String name);
}
