package xyz.lingview.dimstack.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class UserBlacklistService {

    private final StringRedisTemplate redisTemplate;
    private static final String BLACKLIST_KEY = "user:blacklist";

    public UserBlacklistService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void addUserToBlacklist(String username) {
        redisTemplate.opsForSet().add(BLACKLIST_KEY, username);
    }

    public void removeUserFromBlacklist(String username) {
        redisTemplate.opsForSet().remove(BLACKLIST_KEY, username);
    }

    public boolean isUserInBlacklist(String username) {
        return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(BLACKLIST_KEY, username));
    }

    public void clearBlacklist() {
        redisTemplate.delete(BLACKLIST_KEY);
    }

    public Set<String> getBlacklistedUsers() {
        return redisTemplate.opsForSet().members(BLACKLIST_KEY);
    }
}
