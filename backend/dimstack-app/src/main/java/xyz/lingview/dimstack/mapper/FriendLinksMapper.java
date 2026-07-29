package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.FriendLinks;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2025/12/04 18:58:34
 * @Description: 友链接口
 * @Version: 1.0
 */
@Mapper
@Repository
public interface FriendLinksMapper {

    int insert(FriendLinks friendLink);

    int updateStatusById(@Param("id") Integer id, @Param("status") Integer status);

    int updateById(FriendLinks friendLink);

    int deleteById(Integer id);

    int deleteByIdPermanent(Integer id);

    FriendLinks selectById(Integer id);

    List<FriendLinks> selectByPage(@Param("offset") Integer offset,
                                   @Param("limit") Integer limit,
                                   @Param("status") Integer status);

    int count(@Param("status") Integer status);

    List<FriendLinks> selectByStatus(Integer status);

    List<FriendLinks> selectActiveLinks();
}
