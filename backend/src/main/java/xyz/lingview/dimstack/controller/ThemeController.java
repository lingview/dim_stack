package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.config.ThemeProperties;
import xyz.lingview.dimstack.service.SiteConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/theme")
public class ThemeController {

    @Autowired
    private ThemeProperties themeProperties;

    @Autowired
    private SiteConfigService siteConfigService;

    @PostMapping("/switch")
    @RequiresPermission("system:edit")
    public String switchTheme(@RequestParam String themeName) {
        String themesPath = themeProperties.getThemesPath();
        Path themeDir = Path.of(themesPath, themeName);

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
            return "主题以切换至: " + themeName;
        } else {
            return "Error: 主题切换失败: " + themeName;
        }
    }

    @GetMapping("/current")
    @RequiresPermission("system:edit")
    public String getCurrentTheme() {
        return themeProperties.getActiveTheme();
    }

    @GetMapping("/list")
    @RequiresPermission("system:edit")
    public String listAvailableThemes() {
        try {
            StringBuilder result = new StringBuilder("Available themes:\n");
            String themesPath = themeProperties.getThemesPath();
            Path themesDir = Path.of(themesPath);

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
            log.error("主题读取失败", e);
            return "主题读取失败";
        }
    }

    @PostMapping("/validate")
    @RequiresPermission("system:edit")
    public String validateTheme(@RequestParam String themeName) {
        try {
            String themesPath = themeProperties.getThemesPath();
            Path themeDir = Path.of(themesPath, themeName);

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
            log.error("主题验证出错", e);
            return "Error 验证主题出错";
        }
    }

    @GetMapping("/list/json")
    @RequiresPermission("system:edit")
    public ResponseEntity<Map<String, Object>> listAvailableThemesJson() {
        try {
            List<Map<String, Object>> themes = new ArrayList<>();
            String themesPath = themeProperties.getThemesPath();
            Path themesDir = Path.of(themesPath);
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
            log.error("获取主题列表失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error listing themes"
                    ));
        }
    }

}
