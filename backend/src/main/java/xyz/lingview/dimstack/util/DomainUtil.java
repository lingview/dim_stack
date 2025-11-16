package xyz.lingview.dimstack.util;

import jakarta.servlet.http.HttpServletRequest;

/**
 * @Author: lingview
 * @Date: 2025/11/16 10:56:45
 * @Description: 动态获取域名
 * @Version: 1.0
 */
public class DomainUtil {
    public static String getFullDomain(HttpServletRequest request) {
        String scheme = request.getHeader("X-Forwarded-Proto");
        if (scheme == null) scheme = request.getScheme();

        String host = request.getHeader("X-Forwarded-Host");
        if (host == null) host = request.getServerName();

        String portHeader = request.getHeader("X-Forwarded-Port");
        int port;
        if (portHeader != null) {
            port = Integer.parseInt(portHeader);
        } else {
            port = request.getServerPort();
        }

        boolean defaultPort =
                (scheme.equals("http") && port == 80) ||
                        (scheme.equals("https") && port == 443);

        return defaultPort ? (scheme + "://" + host) : (scheme + "://" + host + ":" + port);
    }
}
