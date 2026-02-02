package xyz.lingview.dimstack.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * @Author: lingview
 * @Date: 2026/02/02 13:30:17
 * @Description: 用户浏览器UA和Session绑定过滤
 * @Version: 1.0
 */
@Slf4j
@Component
public class UserAgentSessionFilter implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        HttpSession session = request.getSession(false);

        if (session != null && session.getAttribute("username") != null) {
            String storedUA = (String) session.getAttribute("userAgent");
            String currentUA = request.getHeader("User-Agent");

            if (storedUA == null) {
                return true;
            }

            if (!storedUA.equals(currentUA)) {
                log.warn("User-Agent 不匹配！可能存在会话劫持。Stored: '{}', Current: '{}'", storedUA, currentUA);
                session.invalidate();

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                try {
                    response.getWriter().write("""
                        {"code":401,"message":"会话异常，请重新登录"}
                        """);
                } catch (Exception e) {
                    log.error("返回错误响应失败", e);
                }
                return false;
            }
        }
        return true;
    }
}