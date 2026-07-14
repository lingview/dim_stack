package xyz.lingview.dimstack.service.impl;

import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.service.UserBlacklistService;

import java.util.Set;

@Service
public class UserBlacklistServiceImpl implements UserBlacklistService {

    private final CacheService cacheService;
    private static final String BLACKLIST_KEY = "dimstack:user:blacklist";

    public UserBlacklistServiceImpl(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    @Override
    public void addUserToBlacklist(String username) {
        cacheService.addToSet(BLACKLIST_KEY, username);
    }

    @Override
    public void removeUserFromBlacklist(String username) {
        cacheService.removeFromSet(BLACKLIST_KEY, username);
    }

    @Override
    public boolean isUserInBlacklist(String username) {
        return cacheService.isMemberOfSet(BLACKLIST_KEY, username);
    }

    @Override
    public void clearBlacklist() {
        cacheService.deleteSet(BLACKLIST_KEY);
    }

    @Override
    public Set<String> getBlacklistedUsers() {
        return cacheService.getSetMembers(BLACKLIST_KEY, String.class);
    }
}