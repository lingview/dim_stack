package xyz.lingview.dimstack.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.ApiKeyService;

@Component
@Slf4j
public class TokenAuthResolver {

    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Autowired
    private ApiKeyService apiKeyService;

    @Autowired
    private UserInformationMapper userInformationMapper;

    // 检查请求中是否携带 Bearer 令牌
    public boolean hasToken(HttpServletRequest request) {
        String header = request.getHeader(AUTH_HEADER);
        return header != null && header.startsWith(BEARER_PREFIX);
    }

    public AuthenticatedUser resolve(HttpServletRequest request) {
        String header = request.getHeader(AUTH_HEADER);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            return null;
        }
        String token = header.substring(BEARER_PREFIX.length()).trim();
        if (token.isEmpty()) {
            return null;
        }

        String uuid = apiKeyService.validateAndGetUserId(token);
        if (uuid == null) {
            return null;
        }

        String username = userInformationMapper.getUsernameByUuid(uuid);
        if (username == null) {
            log.warn("API Key 校验通过但未找到对应用户, uuid={}", uuid);
            return null;
        }

        return new AuthenticatedUser(username, uuid, AuthType.TOKEN);
    }
}
