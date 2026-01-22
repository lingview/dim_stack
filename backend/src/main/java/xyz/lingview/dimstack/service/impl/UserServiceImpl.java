package xyz.lingview.dimstack.service.impl;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.Role;
import xyz.lingview.dimstack.domain.UserInformation;
import xyz.lingview.dimstack.dto.request.UserDTO;
import xyz.lingview.dimstack.dto.request.UserUpdateDTO;
import xyz.lingview.dimstack.mapper.SiteConfigMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.UserService;
import xyz.lingview.dimstack.service.UserBlacklistService;
import xyz.lingview.dimstack.util.RandomUtil;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserInformationMapper userInformationMapper;

    @Autowired
    private UserBlacklistService userBlacklistService;

    @Autowired
    private SiteConfigMapper siteConfigMapper;

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
//            System.out.println("头像不在这里设置");
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
            String hashedPassword = BCrypt.hashpw(userUpdateDTO.getPassword(), BCrypt.gensalt());
            user.setPassword(hashedPassword);
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


    // 后台用户管理
    @Override
    public List<UserDTO> getAllUsers() {
        return userInformationMapper.selectAllUsers();
    }

    @Override
    public UserDTO getUserById(Integer id) {
        return userInformationMapper.selectUserById(id);
    }

    @Override
    public boolean updateUserRole(Integer userId, Integer roleId) {
        try {
            int result = userInformationMapper.updateUserRole(userId, roleId);
            return result > 0;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean updateUserStatus(Integer userId, Byte status) {
        try {
            UserDTO user = userInformationMapper.selectUserById(userId);
            if (user == null) {
                return false;
            }

            int result = userInformationMapper.updateUserStatus(userId, status);

            if (status == 0 || status == 2) {
                userBlacklistService.addUserToBlacklist(user.getUsername());
            } else if (status == 1) {
                userBlacklistService.removeUserFromBlacklist(user.getUsername());
            }

            return result > 0;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public List<Role> getAllRoles() {
        return userInformationMapper.selectAllRoles();
    }

    @Override
    public List<String> getUserPermissions(Integer userId) {
        return userInformationMapper.selectPermissionsByUserId(userId);
    }

    @Override
    public void addUserToBlacklist(String username) {
        userBlacklistService.addUserToBlacklist(username);
    }

    @Override
    public void removeUserFromBlacklist(String username) {
        userBlacklistService.removeUserFromBlacklist(username);
    }

    public boolean checkPassword(String plaintextPassword, String hashedPassword) {
        if (plaintextPassword == null || hashedPassword == null) {
            return false;
        }
        return BCrypt.checkpw(plaintextPassword, hashedPassword);
    }


    @Override
    public boolean updateUserByAdmin(UserUpdateDTO userUpdateDTO) {
        UserInformation user = userInformationMapper.selectUserByUUID(userUpdateDTO.getUuid());
        if (user == null) {
            return false;
        }

        if (userUpdateDTO.getUsername() != null && !userUpdateDTO.getUsername().isEmpty()) {
            String existingUserUUID = userInformationMapper.selectUserUUID(userUpdateDTO.getUsername());
            if (existingUserUUID != null && !existingUserUUID.equals(userUpdateDTO.getUuid())) {
                return false;
            }
            user.setUsername(userUpdateDTO.getUsername());
        }

        if (userUpdateDTO.getEmail() != null && !userUpdateDTO.getEmail().isEmpty()) {
            user.setEmail(userUpdateDTO.getEmail());
        }
        if (userUpdateDTO.getPhone() != null && !userUpdateDTO.getPhone().isEmpty()) {
            user.setPhone(userUpdateDTO.getPhone());
        }
        if (userUpdateDTO.getPassword() != null && !userUpdateDTO.getPassword().isEmpty()) {
            String hashedPassword = BCrypt.hashpw(userUpdateDTO.getPassword(), BCrypt.gensalt());
            user.setPassword(hashedPassword);
        }

        int result = userInformationMapper.updateUserByUUID(user);
        return result > 0;
    }

    @Override
    public boolean addUser(UserUpdateDTO userUpdateDTO) {
        // 检查用户名是否已存在
        String existingUserUUID = userInformationMapper.selectUserUUID(userUpdateDTO.getUsername());
        if (existingUserUUID != null) {
            return false;
        }

        UserInformation newUser = new UserInformation();
        newUser.setUuid(RandomUtil.generateUUID());
        newUser.setUsername(userUpdateDTO.getUsername());
        newUser.setEmail(userUpdateDTO.getEmail());
        newUser.setPhone(userUpdateDTO.getPhone());
        newUser.setGender(userUpdateDTO.getGender());

        int defaultRoleId = siteConfigMapper.getRegisterUserPermission();
        newUser.setRole_id(defaultRoleId);

        newUser.setStatus((byte) 1);


        String hashedPassword = BCrypt.hashpw(userUpdateDTO.getPassword(), BCrypt.gensalt());
        newUser.setPassword(hashedPassword);

        if (userUpdateDTO.getBirthday() != null && !userUpdateDTO.getBirthday().isEmpty()) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                Date birthday = sdf.parse(userUpdateDTO.getBirthday());
                newUser.setBirthday(birthday);
            } catch (ParseException e) {
                newUser.setBirthday(null);
            }
        } else {
            newUser.setBirthday(null);
        }

        int result = userInformationMapper.insertUser(newUser);
        return result > 0;
    }

}
