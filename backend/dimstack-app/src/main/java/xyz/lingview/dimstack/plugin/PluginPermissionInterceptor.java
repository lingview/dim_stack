package xyz.lingview.dimstack.plugin;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import xyz.lingview.dimstack.plugin.api.RequiresPermission;
import xyz.lingview.dimstack.service.CurrentUserService;
import xyz.lingview.dimstack.service.UserPermissionCheckService;

/**
 * @Author: lingview
 * @Date: 2026/10/09 14:39:46
 * @Description: 插件接口权限拦截
 * @Version: 1.0
 */
@Component
public class PluginPermissionInterceptor implements HandlerInterceptor {

    private final CurrentUserService currentUserService;
    private final UserPermissionCheckService permissionCheckService;

    public PluginPermissionInterceptor(CurrentUserService currentUserService,
                                       UserPermissionCheckService permissionCheckService) {
        this.currentUserService = currentUserService;
        this.permissionCheckService = permissionCheckService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }
        RequiresPermission requiresPermission = handlerMethod.getMethodAnnotation(RequiresPermission.class);
        if (requiresPermission == null) {
            requiresPermission = handlerMethod.getBeanType().getAnnotation(RequiresPermission.class);
        }
        if (requiresPermission == null) {
            return true;
        }
        String username = currentUserService.getCurrentUsername();
        if (username == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
        String[] permissions = requiresPermission.value();
        boolean hasPermission = requiresPermission.all()
                ? permissionCheckService.hasAllPermissions(username, permissions)
                : permissionCheckService.hasAnyPermission(username, permissions);
        if (!hasPermission) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return false;
        }
        return true;
    }
}
