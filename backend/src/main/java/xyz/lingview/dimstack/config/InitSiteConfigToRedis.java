package xyz.lingview.dimstack.config;

import tools.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import xyz.lingview.dimstack.domain.SiteConfig;
import xyz.lingview.dimstack.service.SiteConfigService;

@Component
@Slf4j
public class InitSiteConfigToRedis implements CommandLineRunner {

    @Autowired
    private SiteConfigService siteConfigService;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        log.info("开始将站点配置加载到Redis");
        try {
            SiteConfig siteConfig = siteConfigService.getSiteConfig();
            if (siteConfig != null) {
                String siteConfigJson = objectMapper.writeValueAsString(siteConfig);
                stringRedisTemplate.opsForValue().set("dimstack:site_config", siteConfigJson);
                log.info("站点配置已成功加载到Redis");
            } else {
                log.warn("未找到站点配置信息，跳过Redis加载");
            }
        } catch (Exception e) {
            log.error("加载站点配置到Redis失败", e);
        }
    }
}
