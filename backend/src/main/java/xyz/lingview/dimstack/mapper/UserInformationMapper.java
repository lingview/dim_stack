package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.dto.request.UserDTO;
import xyz.lingview.dimstack.domain.Role;
import java.util.List;

@Mapper
@Repository
public interface UserInformationMapper {
    String selectUserUUID(String username);

    UserInformation selectUserByUUID(@Param("uuid") String uuid);

    String selectUsernameByUUID(@Param("uuid") String uuid);

    int updateUserByUUID(UserInformation userInformation);

    String getUsernameByUuid(@Param("uuid") String uuid);

    String getEmailByUsername(@Param("username") String username);

    String getUsernameByEmail(@Param("email") String email);

    List<String> getEmailsByPermissionCode(@Param("permissionCode") String permissionCode);

    List<String> getUsernamesByPermissionCode(@Param("permissionCode") String permissionCode);

    String getUsernameByArticleId(@Param("articleId") String articleId);

    List<UserDTO> selectAllUsers();

    UserDTO selectUserById(@Param("id") Integer id);

    int updateUserRole(@Param("userId") Integer userId, @Param("roleId") Integer roleId);

    int updateUserStatus(@Param("userId") Integer userId, @Param("status") Byte status);

    List<Role> selectAllRoles();

    List<String> selectPermissionsByUserId(@Param("userId") Integer userId);

    UserInformation getUserByUsernameAndEmail(@Param("username") String username, @Param("email") String email);

    int updatePasswordByUsername(@Param("username") String username, @Param("password") String password);

    String selectAvatarByUsername(@Param("username") String username);

    int selectUserByUsername(@Param("username") String username);

    int selectUserByPhone(@Param("phone") String phone);

    int selectUserByEmail(@Param("email") String email);
    // 后台添加新用户
    int insertUser(UserInformation user);
}
