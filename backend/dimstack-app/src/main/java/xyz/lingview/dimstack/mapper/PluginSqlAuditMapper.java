package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import xyz.lingview.dimstack.domain.PluginSqlAudit;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/10/01 15:58:41
 * @Description: 插件SQL审计数据访问
 * @Version: 1.0
 */
@Mapper
public interface PluginSqlAuditMapper {

    int insert(PluginSqlAudit audit);

    List<PluginSqlAudit> selectPage(@Param("pluginName") String pluginName,
                                    @Param("offset") int offset,
                                    @Param("size") int size);

    long countByPlugin(@Param("pluginName") String pluginName);
}
