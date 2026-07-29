package xyz.lingview.dimstack.interceptor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.service.CurrentUserService;
import xyz.lingview.dimstack.service.UserPermissionCheckService;

@Component
public class UserPermissionInterceptor implements HandlerInterceptor {

    @Autowired
    private UserPermissionCheckService permissionCheckService;

    @Autowired
    private CurrentUserService currentUserService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        if (handler instanceof HandlerMethod handlerMethod) {
            RequiresPermission requiresPermission = handlerMethod.getMethodAnnotation(RequiresPermission.class);

            if (requiresPermission == null) {
                return true;
            }

            String username = currentUserService.getCurrentUsername();

            if (username == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return false;
            }

            // 检查权限
            String[] permissions = requiresPermission.value();
            boolean allRequired = requiresPermission.all();

            boolean hasPermission;
            if (allRequired) {
                hasPermission = permissionCheckService.hasAllPermissions(username, permissions);
            } else {
                hasPermission = permissionCheckService.hasAnyPermission(username, permissions);
            }

            if (!hasPermission) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return false;
            }
        }

        return true;
    }
}
