package xyz.lingview.dimstack.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.method.HandlerMethod;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.service.UserBlacklistService;
import xyz.lingview.dimstack.service.UserPermissionCheckService;


import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Slf4j
public class SessionAuthFilter implements Filter {

    @Autowired
    private UserBlacklistService userBlacklistService;

    @Autowired
    private UserPermissionCheckService userPermissionCheckService;

    @Autowired
    private TokenAuthResolver tokenAuthResolver;

    // 不需要认证的路径
    private static final Set<String> WHITE_LIST = new HashSet<>(Arrays.asList(
            "/api/login",
            "/api/register",
            "/swagger-ui.html",
            "/v3/api-docs",
            "/swagger-ui/**",
            "/webjars/**",
            "/api/captcha",
            "/api/articles",
            "/api/categories",
            "/api/categories/**",
            "/api/tags/**",
            "/api/categoriesandcount",
            "/api/hot/articles",
            "/api/comments/article/**",
            "/api/frontendgetmenus",
            "/api/site/**",
            "/api/article/**",
            "/api/friend-links/apply",
            "/api/friend-links/approved/page",
            "/v3/api-docs/**",
            "/api/forgot-password/send-captcha",
            "/api/forgot-password/reset",
            "/api/forgot-password/verify",
            "/api/custom-pages/**",
            "/api/proxy/**",
            "/api/music/enabled",
            "/api/friend-links/site-info",
            "/api/announcement",
            "/api/random-article"
    ));

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String requestURI = httpRequest.getRequestURI();
        boolean whitelisted = isWhitelisted(requestURI);

        try {
            AuthenticatedUser principal = resolvePrincipal(httpRequest);

            if (principal != null) {
                if (userBlacklistService.isUserInBlacklist(principal.getUsername())) {
                    log.warn("用户在黑名单中: {}", principal.getUsername());
                    if (principal.getAuthType() == AuthType.SESSION) {
                        HttpSession session = httpRequest.getSession(false);
                        if (session != null) {
                            session.invalidate();
                        }
                    }
                    writeUnauthorized(httpResponse, "该用户已被拉黑");
                    return;
                }
                UserContextHolder.set(principal);
            }

            if (whitelisted) {
                log.debug("路径在白名单中，放行: {}", requestURI);
                chain.doFilter(request, response);
                return;
            }
            if (principal == null) {
                log.info("用户未登录或会话已过期: {}", requestURI);
                writeUnauthorized(httpResponse, "未登录或会话已过期");
                return;
            }

            if (!checkPermission(httpRequest, httpResponse, principal.getUsername())) {
                return;
            }

            chain.doFilter(request, response);
        } finally {
            UserContextHolder.clear();
        }
    }

    private AuthenticatedUser resolvePrincipal(HttpServletRequest httpRequest) {
        if (tokenAuthResolver.hasToken(httpRequest)) {
            AuthenticatedUser tokenUser = tokenAuthResolver.resolve(httpRequest);
            if (tokenUser != null) {
                return tokenUser;
            }
            return null;
        }

        HttpSession session = httpRequest.getSession(false);
        if (session != null && Boolean.TRUE.equals(session.getAttribute("isLoggedIn"))) {
            Object username = session.getAttribute("username");
            if (username != null) {
                return new AuthenticatedUser((String) username, null, AuthType.SESSION);
            }
        }
        return null;
    }

    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"success\":false,\"message\":\"" + message + "\"}");
    }

    private boolean checkPermission(HttpServletRequest request, HttpServletResponse response, String username)
            throws IOException {

        Object handler = request.getAttribute("handler");
        if (handler instanceof HandlerMethod handlerMethod) {

            RequiresPermission requiresPermission = handlerMethod.getMethodAnnotation(RequiresPermission.class);
            if (requiresPermission != null) {
                String[] requiredPermissions = requiresPermission.value();
                boolean allRequired = requiresPermission.all();

                boolean hasPermission;
                if (allRequired) {
                    hasPermission = userPermissionCheckService.hasAllPermissions(username, requiredPermissions);
                } else {
                    hasPermission = userPermissionCheckService.hasAnyPermission(username, requiredPermissions);
                }

                if (!hasPermission) {
                    log.warn("用户权限不足: 用户={}, 权限={}", username, Arrays.toString(requiredPermissions));
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"success\":false,\"message\":\"权限不足\"}");
                    return false;
                }

                return true;
            }
        }

        // 如果没有@RequiresPermission注解，则放行
        return true;
    }

    private boolean isWhitelisted(String requestURI) {
        boolean isWhitelisted = WHITE_LIST.stream().anyMatch(pattern -> {
            if (pattern.endsWith("/**")) {
                String prefix = pattern.substring(0, pattern.length() - 3);
                return requestURI.startsWith(prefix);
            } else {
                return requestURI.equals(pattern);
            }
        });
        log.debug("路径是否在白名单中: {} -> {}", requestURI, isWhitelisted);
        return isWhitelisted;
    }
}
