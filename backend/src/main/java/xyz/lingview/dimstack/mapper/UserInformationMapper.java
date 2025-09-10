package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.UserInformation;

@Mapper
@Repository
public interface UserInformationMapper {
    String selectUserUUID(String username);

    UserInformation selectUserByUUID(@Param("uuid") String uuid);

    int updateUserByUUID(UserInformation userInformation);

    String getUsernameByUuid(@Param("uuid") String uuid);

}
