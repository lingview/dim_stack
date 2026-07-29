package xyz.lingview.dimstack.config;

import tools.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import xyz.lingview.dimstack.domain.SiteConfig;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.service.SiteConfigService;

@Component
@Slf4j
public class InitSiteConfigToRedis implements CommandLineRunner {

    @Autowired
    private SiteConfigService siteConfigService;

    @Autowired
    private CacheService cacheService;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        log.info("开始将站点配置加载到缓存");
        try {
            SiteConfig siteConfig = siteConfigService.getSiteConfig();
            if (siteConfig != null) {
                cacheService.set("dimstack:site_config", siteConfig);
                log.info("站点配置已成功加载到缓存");
            } else {
                log.warn("未找到站点配置信息，跳过缓存加载");
            }
        } catch (Exception e) {
            log.error("加载站点配置到缓存失败", e);
        }
    }
}
