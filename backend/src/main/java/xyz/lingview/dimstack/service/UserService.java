package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.dto.UserUpdateDTO;

public interface UserService {
    UserInformation getUserByUUID(String uuid);
    boolean updateUserInfo(UserUpdateDTO userUpdateDTO);
    String getUserUUID(String username);
}
