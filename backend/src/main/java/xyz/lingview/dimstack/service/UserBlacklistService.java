package xyz.lingview.dimstack.service;

import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class UserBlacklistService {

    private final CacheService cacheService;
    private static final String BLACKLIST_KEY = "dimstack:user:blacklist";

    public UserBlacklistService(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    public void addUserToBlacklist(String username) {
        cacheService.addToSet(BLACKLIST_KEY, username);
    }

    public void removeUserFromBlacklist(String username) {
        cacheService.removeFromSet(BLACKLIST_KEY, username);
    }

    public boolean isUserInBlacklist(String username) {
        return cacheService.isMemberOfSet(BLACKLIST_KEY, username);
    }

    public void clearBlacklist() {
        cacheService.deleteSet(BLACKLIST_KEY);
    }

    public Set<String> getBlacklistedUsers() {
        return cacheService.getSetMembers(BLACKLIST_KEY, String.class);
    }
}
