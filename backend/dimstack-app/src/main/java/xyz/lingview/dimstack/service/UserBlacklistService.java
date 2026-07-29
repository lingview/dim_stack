package xyz.lingview.dimstack.service;

import java.util.Set;

public interface UserBlacklistService {

    void addUserToBlacklist(String username);

    void removeUserFromBlacklist(String username);

    boolean isUserInBlacklist(String username);

    void clearBlacklist();

    Set<String> getBlacklistedUsers();
}