package xyz.lingview.dimstack.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class DynamicResourceResolver {

    @Autowired
    private ThemeProperties themeProperties;

    @Autowired
    private ResourceLoader resourceLoader;

    public Resource resolveResource(HttpServletRequest request) {
        try {
            String requestURI = request.getRequestURI();
            String contextPath = request.getContextPath();

            String resourcePath = requestURI.substring(contextPath.length());
            if (!resourcePath.startsWith("/")) {
                resourcePath = "/" + resourcePath;
            }

            String cleanPath = resourcePath.substring(1);

            String themesPath = themeProperties.getThemesPath();
            String activeTheme = themeProperties.getActiveTheme();

            if (StringUtils.hasText(themesPath) && StringUtils.hasText(activeTheme)) {
                Path themeResourcePath = Paths.get(themesPath, activeTheme).resolve(cleanPath);
                File themeResourceFile = themeResourcePath.toFile();

                if (themeResourceFile.exists() && themeResourceFile.isFile()) {
                    return resourceLoader.getResource(themeResourceFile.toURI().toString());
                }
            }

            String classpathResourceLocation = "classpath:/static/" + cleanPath;
            Resource classpathResource = resourceLoader.getResource(classpathResourceLocation);

            if (classpathResource.exists() && classpathResource.isReadable()) {
                return classpathResource;
            }

            Resource rootResource = resourceLoader.getResource("classpath:/" + cleanPath);
            if (rootResource.exists() && rootResource.isReadable()) {
                return rootResource;
            }

            return null;

        } catch (Exception e) {
            return null;
        }
    }
}