package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.CustomPage;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/01/17 20:10:26
 * @Description:
 * @Version: 1.0
 */

@Mapper
@Repository
public interface CustomPageMapper {
    int insert(CustomPage customPage);

    int updateByPrimaryKey(CustomPage customPage);

    int deleteByPrimaryKey(Integer id);

    CustomPage selectByPrimaryKey(Integer id);

    CustomPage selectByAlias(String alias);

    List<CustomPage> selectByUserId(String uuid);

    List<CustomPage> selectAll();

    int updateStatus(@Param("id") Integer id, @Param("status") Integer status);
}