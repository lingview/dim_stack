package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.dto.UserDTO;
import xyz.lingview.dimstack.domain.Role;
import java.util.List;

@Mapper
@Repository
public interface UserInformationMapper {
    String selectUserUUID(String username);

    UserInformation selectUserByUUID(@Param("uuid") String uuid);

    int updateUserByUUID(UserInformation userInformation);

    String getUsernameByUuid(@Param("uuid") String uuid);

    List<UserDTO> selectAllUsers();

    UserDTO selectUserById(@Param("id") Integer id);

    int updateUserRole(@Param("userId") Integer userId, @Param("roleId") Integer roleId);

    int updateUserStatus(@Param("userId") Integer userId, @Param("status") Byte status);

    List<Role> selectAllRoles();

    List<String> selectPermissionsByUserId(@Param("userId") Integer userId);

}
