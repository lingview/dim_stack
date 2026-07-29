package xyz.lingview.dimstack.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import xyz.lingview.dimstack.domain.SiteConfig;
import xyz.lingview.dimstack.service.SiteConfigService;

@Component
@ConfigurationProperties(prefix = "app.theme")
@Slf4j
public class ThemeProperties implements ApplicationListener<ApplicationReadyEvent> {

    @Autowired
    private SiteConfigService siteConfigService;

    private String activeTheme = "default";
    private String themesPath = "themes";

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        try {
            SiteConfig siteConfig = siteConfigService.getSiteConfig();
            if (siteConfig != null && siteConfig.getSite_theme() != null && !siteConfig.getSite_theme().isEmpty()) {
                this.activeTheme = siteConfig.getSite_theme();
//                System.out.println("已加载主题：" + activeTheme);
                log.info("已加载主题：{}", activeTheme);
            } else {
//                System.out.println("未找到站点主题配置，使用默认主题：" + activeTheme);
                log.warn("未找到站点主题配置，使用默认主题：{}", activeTheme);
            }
        } catch (Exception e) {
//            System.err.println("初始化主题失败：" + e.getMessage());
            log.error("初始化主题失败：{}", e.getMessage());
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
