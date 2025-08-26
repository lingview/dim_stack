package xyz.lingview.dimstack.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import xyz.lingview.dimstack.service.UserBlacklistService;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
@Slf4j
public class SessionAuthFilter implements Filter {

    @Autowired
    private UserBlacklistService userBlacklistService;

    // 不需要认证的路径
    private static final Set<String> WHITE_LIST = new HashSet<>(Arrays.asList(
        "/api/login",
        "/api/register",
        "/swagger-ui.html",
        "/v3/api-docs",
        "/swagger-ui/**",
        "/webjars/**",
        "/api/captcha",
        "/v3/api-docs/**"
    ));

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String requestURI = httpRequest.getRequestURI();

        // 检查是否在白名单中
        if (isWhitelisted(requestURI)) {
            chain.doFilter(request, response);
            return;
        }

        // 检查session中的用户信息
        HttpSession session = httpRequest.getSession(false);
        if (session != null && Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            // 检查用户是否在黑名单中
            String username = (String) session.getAttribute("username");
            if (username != null && userBlacklistService.isUserInBlacklist(username)) {
                session.invalidate(); // 清除被拉黑用户的session
                httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                httpResponse.setContentType("application/json;charset=UTF-8");
                httpResponse.getWriter().write("{\"success\":false,\"message\":\"该用户已被拉黑\"}");
                return;
            }

            chain.doFilter(request, response);
        } else {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json;charset=UTF-8");
            httpResponse.getWriter().write("{\"success\":false,\"message\":\"未登录或会话已过期\"}");
        }
    }

    private boolean isWhitelisted(String requestURI) {
        return WHITE_LIST.stream().anyMatch(pattern -> {
            if (pattern.endsWith("/**")) {
                String prefix = pattern.substring(0, pattern.length() - 3);
                return requestURI.startsWith(prefix);
            } else {
                return requestURI.equals(pattern);
            }
        });
    }
}
