package xyz.lingview.dimstack.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import xyz.lingview.dimstack.domain.SiteConfig;
import xyz.lingview.dimstack.service.SiteConfigService;

@Component
@ConfigurationProperties(prefix = "app.theme")
public class ThemeProperties {

    @Autowired
    private SiteConfigService siteConfigService;

    private String activeTheme = "default";
    private String themesPath = "themes";

    @PostConstruct
    public void init() {
        SiteConfig siteConfig = siteConfigService.getSiteConfig();
        if (siteConfig != null && siteConfig.getSite_theme() != null && !siteConfig.getSite_theme().isEmpty()) {
            this.activeTheme = siteConfig.getSite_theme();
        }
    }

    public String getActiveTheme() {
        return activeTheme;
    }

    public void setActiveTheme(String activeTheme) {
        this.activeTheme = activeTheme;
    }

    public String getThemesPath() {
        return themesPath;
    }

    public void setThemesPath(String themesPath) {
        this.themesPath = themesPath;
    }
}
