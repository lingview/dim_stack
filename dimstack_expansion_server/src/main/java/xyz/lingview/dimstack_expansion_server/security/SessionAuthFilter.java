package xyz.lingview.dimstack_expansion_server.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import xyz.lingview.dimstack_expansion_server.annotation.RequiresPermission;
import xyz.lingview.dimstack_expansion_server.service.UserBlacklistService;
import xyz.lingview.dimstack_expansion_server.service.UserPermissionCheckService;

import java.io.IOException;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Set;

@Component
@Slf4j
public class SessionAuthFilter implements Filter {

    @Autowired
    private UserBlacklistService userBlacklistService;

    @Autowired
    private UserPermissionCheckService userPermissionCheckService;

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
        "/api/categoriesandcount",
        "/api/hot/articles",
        "/api/comments/article/**",
        "/api/frontendgetmenus",
        "/api/site/**",
        "/api/article/**",
        "/v3/api-docs/**"
    ));

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String requestURI = httpRequest.getRequestURI();

        System.out.println("=== SessionAuthFilter 调试信息 ===");
        System.out.println("请求URI: " + requestURI);
        System.out.println("请求方法: " + httpRequest.getMethod());

        System.out.println("=== 请求头信息 ===");
        Enumeration<String> headerNames = httpRequest.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            System.out.println(headerName + ": " + httpRequest.getHeader(headerName));
        }
        System.out.println("=== 请求头信息结束 ===");

        System.out.println("=== Cookie信息 ===");
        jakarta.servlet.http.Cookie[] cookies = httpRequest.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                System.out.println(cookie.getName() + ": " + cookie.getValue());
            }
        } else {
            System.out.println("没有Cookie");
        }
        System.out.println("=== Cookie信息结束 ===");

        if (isWhitelisted(requestURI)) {
            System.out.println("路径在白名单中，放行: " + requestURI);
            chain.doFilter(request, response);
            return;
        }

        HttpSession session = httpRequest.getSession(false);
        System.out.println("Session对象: " + session);

        if (session != null) {
            System.out.println("Session ID: " + session.getId());

            Enumeration<String> attrNames = session.getAttributeNames();
            System.out.println("所有Session属性:");
            while (attrNames.hasMoreElements()) {
                String name = attrNames.nextElement();
                System.out.println("  " + name + ": " + session.getAttribute(name));
            }
            Object isLoggedIn = session.getAttribute("isLoggedIn");
            Object username = session.getAttribute("username");
            System.out.println("isLoggedIn属性: " + isLoggedIn);
            System.out.println("username属性: " + username);

            if (Boolean.TRUE.equals(isLoggedIn)) {
                if (username != null && userBlacklistService.isUserInBlacklist((String) username)) {
                    System.out.println("用户在黑名单中: " + username);
                    session.invalidate(); // 清除被拉黑用户的session
                    httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    httpResponse.setContentType("application/json;charset=UTF-8");
                    httpResponse.getWriter().write("{\"success\":false,\"message\":\"该用户已被拉黑\"}");
                    return;
                }

                if (!checkPermission(httpRequest, httpResponse, (String) username)) {
                    return;
                }

                System.out.println("用户已登录，放行请求");
                chain.doFilter(request, response);
            } else {
                System.out.println("用户未登录或会话已过期");
                httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                httpResponse.setContentType("application/json;charset=UTF-8");
                httpResponse.getWriter().write("{\"success\":false,\"message\":\"未登录或会话已过期\"}");
            }
        } else {
            System.out.println("没有找到Session");
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json;charset=UTF-8");
            httpResponse.getWriter().write("{\"success\":false,\"message\":\"未登录或会话已过期\"}");
        }

    }


    private boolean checkPermission(HttpServletRequest request, HttpServletResponse response, String username)
            throws IOException {

        Object handler = request.getAttribute("handler");
        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;

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
