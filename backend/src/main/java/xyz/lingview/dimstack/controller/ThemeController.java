package xyz.lingview.dimstack.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import xyz.lingview.dimstack.config.ThemeProperties;
import xyz.lingview.dimstack.service.SiteConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/theme")
public class ThemeController {

    @Autowired
    private ThemeProperties themeProperties;

    @Autowired
    private SiteConfigService siteConfigService;

    @PostMapping("/switch")
    public String switchTheme(@RequestParam String themeName) {
        String themesPath = themeProperties.getThemesPath();
        Path themeDir = Paths.get(themesPath, themeName);

        if (!Files.exists(themeDir) || !Files.isDirectory(themeDir)) {
            return "Error: Theme directory '" + themeName + "' does not exist or is not a directory";
        }

        themeProperties.setActiveTheme(themeName);
        boolean success = siteConfigService.updateSiteTheme(themeName);

        if (!success) {
            return "Error: Failed to save theme to database";
        }

        String currentTheme = themeProperties.getActiveTheme();
        if (currentTheme.equals(themeName)) {
            return "Theme successfully switched to: " + themeName;
        } else {
            return "Error: Failed to switch theme to: " + themeName;
        }
    }

    @GetMapping("/current")
    public String getCurrentTheme() {
        return themeProperties.getActiveTheme();
    }

    @GetMapping("/list")
    public String listAvailableThemes() {
        try {
            StringBuilder result = new StringBuilder("Available themes:\n");
            String themesPath = themeProperties.getThemesPath();
            Path themesDir = Paths.get(themesPath);

            if (Files.exists(themesDir) && Files.isDirectory(themesDir)) {
                Files.list(themesDir)
                    .filter(Files::isDirectory)
                    .forEach(dir -> {
                        String themeName = dir.getFileName().toString();
                        String currentMarker = themeName.equals(themeProperties.getActiveTheme()) ? " (current)" : "";
                        result.append("- ").append(themeName).append(currentMarker).append("\n");
                    });
            } else {
                result.append("Themes directory not found: ").append(themesPath);
            }

            return result.toString();
        } catch (Exception e) {
            return "Error listing themes: " + e.getMessage();
        }
    }

    @PostMapping("/validate")
    public String validateTheme(@RequestParam String themeName) {
        try {
            String themesPath = themeProperties.getThemesPath();
            Path themeDir = Paths.get(themesPath, themeName);

            if (!Files.exists(themeDir)) {
                return "Theme '" + themeName + "' does not exist";
            }

            if (!Files.isDirectory(themeDir)) {
                return "Path '" + themeName + "' is not a directory";
            }

            Path indexFile = themeDir.resolve("index.html");
            if (Files.exists(indexFile)) {
                return "Theme '" + themeName + "' is valid and has index.html";
            } else {
                return "Theme '" + themeName + "' is valid but does not have index.html";
            }
        } catch (Exception e) {
            return "Error validating theme: " + e.getMessage();
        }
    }

    @GetMapping("/list/json")
    public ResponseEntity<Map<String, Object>> listAvailableThemesJson() {
        try {
            List<Map<String, Object>> themes = new ArrayList<>();
            String themesPath = themeProperties.getThemesPath();
            Path themesDir = Paths.get(themesPath);
            String activeTheme = themeProperties.getActiveTheme();

            if (Files.exists(themesDir) && Files.isDirectory(themesDir)) {
                Files.list(themesDir)
                        .filter(Files::isDirectory)
                        .forEach(dir -> {
                            String themeName = dir.getFileName().toString();
                            Map<String, Object> themeInfo = new HashMap<>();
                            themeInfo.put("name", themeName);
                            themeInfo.put("slug", themeName);
                            themeInfo.put("isCurrent", themeName.equals(activeTheme));
                            themes.add(themeInfo);
                        });
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", themes
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error listing themes: " + e.getMessage()
                    ));
        }
    }

}
