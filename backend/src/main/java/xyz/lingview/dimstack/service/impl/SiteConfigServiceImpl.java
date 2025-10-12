package xyz.lingview.dimstack.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.SiteConfig;
import xyz.lingview.dimstack.dto.request.HeroDTO;
import xyz.lingview.dimstack.mapper.SiteConfigMapper;
import xyz.lingview.dimstack.service.SiteConfigService;

@Service
@Slf4j
public class SiteConfigServiceImpl implements SiteConfigService {

    @Autowired
    private SiteConfigMapper siteConfigMapper;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public SiteConfig getSiteConfig() {
        try {
            String siteConfigJson = stringRedisTemplate.opsForValue().get("dimstack:site_config");
            if (siteConfigJson != null) {
                return objectMapper.readValue(siteConfigJson, SiteConfig.class);
            }
        } catch (Exception e) {
            log.warn("从Redis读取站点配置失败，回退到数据库查询", e);
        }
        return siteConfigMapper.getSiteConfig();
    }

    @Override
    public HeroDTO getHeroConfig() {
        SiteConfig config = getSiteConfig();
        if (config != null) {
            HeroDTO heroDTO = new HeroDTO();
            heroDTO.setTitle(config.getHero_title());
            heroDTO.setSubtitle(config.getHero_subtitle());
            heroDTO.setImage(config.getHero_image());
            return heroDTO;
        }
        return null;
    }

    @Override
    public String getCopyright() {
        SiteConfig config = getSiteConfig();
        if (config != null) {
            return config.getCopyright();
        }
        return null;
    }

    @Override
    public String getSiteName() {
        SiteConfig config = getSiteConfig();
        if (config != null) {
            return config.getSite_name();
        }
        return null;
    }

    @Override
    public String getSiteIcon() {
        SiteConfig config = getSiteConfig();
        if (config != null) {
            return config.getSite_icon();
        }
        return null;
    }

    @Override
    public String getSiteTheme() {
        SiteConfig config = getSiteConfig();
        if (config != null) {
            return config.getSite_theme();
        }
        return null;
    }

    @Override
    public String getExpansionServer() {
        SiteConfig config = getSiteConfig();
        if (config != null) {
            return config.getExpansion_server();
        }
        return null;
    }

    @Override
    public boolean updateSiteTheme(String themeName) {
        try {
            SiteConfig config = getSiteConfig();
            if (config != null) {
                config.setSite_theme(themeName);
                int result = siteConfigMapper.updateSiteConfig(config);
                if (result > 0) {
                    // 更新Redis缓存
                    updateRedisCache(config);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            log.error("更新站点主题失败", e);
            return false;
        }
    }

    @Override
    public boolean updateSiteConfig(SiteConfig siteConfig) {
        try {
            int result = siteConfigMapper.updateSiteConfig(siteConfig);
            if (result > 0) {
                // 更新Redis缓存
                updateRedisCache(siteConfig);
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("更新站点配置失败", e);
            return false;
        }
    }

    /**
     * 更新Redis缓存
     * @param siteConfig 站点配置
     */
    private void updateRedisCache(SiteConfig siteConfig) {
        try {
            String siteConfigJson = objectMapper.writeValueAsString(siteConfig);
            stringRedisTemplate.opsForValue().set("dimstack:site_config", siteConfigJson);
            log.info("站点配置已同步更新到Redis");
        } catch (Exception e) {
            log.error("同步站点配置到Redis失败", e);
        }
    }
}
