package xyz.lingview.dimstack.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.dto.UserUpdateDTO;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.UserService;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserInformationMapper userInformationMapper;

    @Override
    public UserInformation getUserByUUID(String uuid) {
        return userInformationMapper.selectUserByUUID(uuid);
    }

    @Override
    public boolean updateUserInfo(UserUpdateDTO userUpdateDTO) {
        UserInformation user = new UserInformation();
        user.setUuid(userUpdateDTO.getUuid());

        if (userUpdateDTO.getUsername() != null && !userUpdateDTO.getUsername().isEmpty()) {
            user.setUsername(userUpdateDTO.getUsername());
        }
        if (userUpdateDTO.getAvatar() != null && !userUpdateDTO.getAvatar().isEmpty()) {
            System.out.println("头像不在这里设置");
        }
        if (userUpdateDTO.getPhone() != null && !userUpdateDTO.getPhone().isEmpty()) {
            user.setPhone(userUpdateDTO.getPhone());
        }
        if (userUpdateDTO.getEmail() != null && !userUpdateDTO.getEmail().isEmpty()) {
            user.setEmail(userUpdateDTO.getEmail());
        }
        if (userUpdateDTO.getGender() != null && !userUpdateDTO.getGender().isEmpty()) {
            user.setGender(userUpdateDTO.getGender());
        }
        if (userUpdateDTO.getPassword() != null && !userUpdateDTO.getPassword().isEmpty()) {
            user.setPassword(userUpdateDTO.getPassword());
        }

        if (userUpdateDTO.getBirthday() != null && !userUpdateDTO.getBirthday().isEmpty()) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                Date birthday = sdf.parse(userUpdateDTO.getBirthday());
                user.setBirthday(birthday);
            } catch (ParseException e) {
                user.setBirthday(null);
            }
        } else {
            user.setBirthday(null);
        }

        int result = userInformationMapper.updateUserByUUID(user);
        return result > 0;
    }

    @Override
    public String getUserUUID(String username) {
        return userInformationMapper.selectUserUUID(username);
    }
}
