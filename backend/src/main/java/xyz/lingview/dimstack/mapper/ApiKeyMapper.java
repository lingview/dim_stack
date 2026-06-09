package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.ApiKey;

import java.util.List;

@Mapper
@Repository
public interface ApiKeyMapper {

    int insert(ApiKey apiKey);

    List<ApiKey> selectByUserId(@Param("userId") String userId);

    ApiKey selectByIdAndUserId(@Param("id") Integer id, @Param("userId") String userId);

    ApiKey selectByKeyHash(@Param("keyHash") String keyHash);

    int updateStatusByIdAndUserId(@Param("id") Integer id,
                                  @Param("userId") String userId,
                                  @Param("status") Integer status);

    int deleteByIdAndUserId(@Param("id") Integer id, @Param("userId") String userId);

    int countByKeyHash(@Param("keyHash") String keyHash);
}
