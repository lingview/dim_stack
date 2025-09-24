package xyz.lingview.dimstack_expansion_server.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@Component
@Order(1)
@Slf4j
public class SecurityFilter implements Filter {

    // 白名单（用于富文本等特殊情况）
    private static final Set<String> WHITELIST_VALUES = Set.of("<p><strong>Rich text allowed</strong></p>");

    // 敏感字段（不检查）
    private static final Set<String> SENSITIVE_FIELDS = Set.of("token");

    // XSS检测正则
    private static final Pattern[] XSS_PATTERNS = {

    };

    // SQL注入检测正则
    private static final Pattern[] SQLI_PATTERNS = {

    };

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String clientIp = getClientIP(httpRequest);

        Map<String, String[]> params = httpRequest.getParameterMap();
        for (Map.Entry<String, String[]> entry : params.entrySet()) {
            String key = entry.getKey();
            if (SENSITIVE_FIELDS.contains(key)) continue;
            for (String value : entry.getValue()) {
                if (isMalicious(value)) {
                    logAndReject(httpResponse, clientIp, key, value, "RequestParam attack");
                    return;
                }
            }
        }

        if (needsBodyCheck(httpRequest)) {
            try {
                RepeatableReadRequestWrapper wrapped = new RepeatableReadRequestWrapper(httpRequest);
                String body = wrapped.getCachedBodyAsString();

                // 检查body是否恶意
                if (body != null && !body.trim().isEmpty() && !WHITELIST_VALUES.contains(body) && isMalicious(body)) {
                    logAndReject(httpResponse, clientIp, "request_body", body, "JSON Body attack");
                    return;
                }

                wrapped.setAttribute("wrappedRequest", wrapped);
                chain.doFilter(wrapped, response);
                return;
            } catch (Exception e) {
                log.error("Error reading request body", e);
                httpResponse.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid request body");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    // 判断字符串是否包含XSS或SQL注入特征

    private boolean isMalicious(String value) {
        if (value == null || value.trim().isEmpty()) return false;
        for (Pattern p : XSS_PATTERNS) {
            if (p.matcher(value).find()) {
                return true;
            }
        }
        for (Pattern p : SQLI_PATTERNS) {
            if (p.matcher(value).find()) {
                return true;
            }
        }
        return false;
    }


    private boolean needsBodyCheck(HttpServletRequest request) {
        String method = request.getMethod();
        if (!("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method))) {
            return false;
        }
        String contentType = request.getContentType();
        if (contentType == null) return false;
        contentType = contentType.toLowerCase();
        return contentType.contains("application/json") && !contentType.startsWith("multipart/");
    }


    private String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }


    private void logAndReject(HttpServletResponse response, String ip, String field, String value, String type) throws IOException {
        log.error("{} - [SECURITY] {} detected, IP: {}, Field: {}, Value: {}",
                LocalDateTime.now(), type, ip, field, mask(value));
        response.sendError(HttpServletResponse.SC_BAD_REQUEST, type + " detected in field: " + field);
    }

    private String mask(String s) {
        if (s == null) return null;
        return s.length() > 512 ? s.substring(0, 512) + "...(truncated)" : s;
    }
}