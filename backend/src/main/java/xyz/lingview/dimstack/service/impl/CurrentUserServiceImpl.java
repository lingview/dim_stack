package xyz.lingview.dimstack.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.security.AuthType;
import xyz.lingview.dimstack.security.AuthenticatedUser;
import xyz.lingview.dimstack.security.UserContextHolder;
import xyz.lingview.dimstack.service.CurrentUserService;

/**
 * @Author: lingview
 * @Data: 2026/06/09 11:45:39
 * @Description: 当前登录用户统一访问抽象层实现
 * @Version: 1.0
 */
@Service
public class CurrentUserServiceImpl implements CurrentUserService {

    @Autowired
    private UserInformationMapper userInformationMapper;

    @Override
    public boolean isAuthenticated() {
        return UserContextHolder.get() != null;
    }

    @Override
    public String getCurrentUsername() {
        AuthenticatedUser user = UserContextHolder.get();
        return user == null ? null : user.getUsername();
    }

    @Override
    public String getCurrentUserUuid() {
        AuthenticatedUser user = UserContextHolder.get();
        if (user == null) {
            return null;
        }
        if (user.getUuid() == null && user.getUsername() != null) {
            user.setUuid(userInformationMapper.selectUserUUID(user.getUsername()));
        }
        return user.getUuid();
    }

    @Override
    public AuthenticatedUser getCurrentUser() {
        return UserContextHolder.get();
    }

    @Override
    public AuthType getCurrentAuthType() {
        AuthenticatedUser user = UserContextHolder.get();
        return user == null ? null : user.getAuthType();
    }
}
