package xyz.lingview.dimstack.interceptor;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import xyz.lingview.dimstack.config.ThemeProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Component
public class ThemeResourceFilter implements Filter {

    @Autowired
    private ThemeProperties themeProperties;

    private static final Map<String, String> CONTENT_TYPES = new HashMap<>();

    static {
        CONTENT_TYPES.put(".html", "text/html");
        CONTENT_TYPES.put(".htm", "text/html");
        CONTENT_TYPES.put(".css", "text/css");
        CONTENT_TYPES.put(".js", "application/javascript");
        CONTENT_TYPES.put(".json", "application/json");
        CONTENT_TYPES.put(".xml", "application/xml");
        CONTENT_TYPES.put(".png", "image/png");
        CONTENT_TYPES.put(".jpg", "image/jpeg");
        CONTENT_TYPES.put(".jpeg", "image/jpeg");
        CONTENT_TYPES.put(".gif", "image/gif");
        CONTENT_TYPES.put(".bmp", "image/bmp");
        CONTENT_TYPES.put(".ico", "image/x-icon");
        CONTENT_TYPES.put(".svg", "image/svg+xml");
        CONTENT_TYPES.put(".woff", "font/woff");
        CONTENT_TYPES.put(".woff2", "font/woff2");
        CONTENT_TYPES.put(".ttf", "font/ttf");
        CONTENT_TYPES.put(".eot", "application/vnd.ms-fontobject");
        CONTENT_TYPES.put(".txt", "text/plain");
        CONTENT_TYPES.put(".pdf", "application/pdf");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String uri = httpRequest.getRequestURI();
        String contextPath = httpRequest.getContextPath();

        String resourcePath = uri.substring(contextPath.length());

        if (!resourcePath.startsWith("/")) {
            resourcePath = "/" + resourcePath;
        }

        if (resourcePath.startsWith("/api/") ||
            resourcePath.startsWith("/v3/api-docs") ||
            resourcePath.startsWith("/swagger-ui") ||
            resourcePath.startsWith("/upload/") ||
            resourcePath.startsWith("/dashboard")) {
            chain.doFilter(request, response);
            return;
        }

        if (resourcePath.equals("/") || resourcePath.equals("")) {
            resourcePath = "/index.html";
        }

        if (shouldHandleAsThemeResource(resourcePath)) {
            Resource resource = resolveResource(resourcePath);
            if (resource != null && resource.exists()) {
                serveResource(resource, httpResponse);
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private boolean shouldHandleAsThemeResource(String resourcePath) {
        return resourcePath.startsWith("/assets/") ||
               resourcePath.startsWith("/static/") ||
               resourcePath.contains(".") ||
               resourcePath.equals("/index.html");
    }

    private Resource resolveResource(String resourcePath) {
        try {
            String themesPath = themeProperties.getThemesPath();
            String activeTheme = themeProperties.getActiveTheme();

            String cleanResourcePath = resourcePath.startsWith("/") ? resourcePath.substring(1) : resourcePath;

            Path themeResourcePath = Path.of(themesPath, activeTheme, cleanResourcePath);
            File themeResourceFile = themeResourcePath.toFile();

            if (themeResourceFile.exists() && themeResourceFile.isFile()) {
                return new UrlResource(themeResourceFile.toURI());
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private void serveResource(Resource resource, HttpServletResponse response) throws IOException {
        try {
            Path path = resource.getFile().toPath();
            String fileName = path.getFileName().toString();
            String contentType = getContentType(fileName);

            response.setContentType(contentType);
            response.setContentLengthLong(Files.size(path));

            response.setHeader("Cache-Control", "public, max-age=3600");

            try (OutputStream out = response.getOutputStream()) {
                Files.copy(path, out);
                out.flush();
            }
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    private String getContentType(String fileName) {
        String extension = "";
        int lastDot = fileName.lastIndexOf('.');
        if (lastDot > 0) {
            extension = fileName.substring(lastDot).toLowerCase();
        }

        return CONTENT_TYPES.getOrDefault(extension, "application/octet-stream");
    }
}
