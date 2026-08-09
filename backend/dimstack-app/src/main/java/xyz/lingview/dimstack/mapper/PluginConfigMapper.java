package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * @Author: lingview
 * @Date: 2026/08/09 22:11:27
 * @Description: 插件配置数据访问
 * @Version: 1.0
 */
@Mapper
public interface PluginConfigMapper {

    String selectValue(@Param("pluginName") String pluginName, @Param("configKey") String configKey);

    int upsert(@Param("pluginName") String pluginName,
               @Param("configKey") String configKey,
               @Param("configValue") String configValue);

    int deleteByPluginName(@Param("pluginName") String pluginName);
}
