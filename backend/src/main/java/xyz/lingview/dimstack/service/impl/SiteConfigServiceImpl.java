package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.SiteConfig;
import xyz.lingview.dimstack.dto.request.HeroDTO;
import xyz.lingview.dimstack.mapper.SiteConfigMapper;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.service.SiteConfigService;

@Service
@Slf4j
public class SiteConfigServiceImpl implements SiteConfigService {

    @Autowired
    private SiteConfigMapper siteConfigMapper;

    @Autowired
    private CacheService cacheService;


    @Override
    public SiteConfig getSiteConfig() {
        try {
            SiteConfig siteConfig = cacheService.get("dimstack:site_config", SiteConfig.class);
            if (siteConfig != null) {
                return siteConfig;
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
    public String getIcpRecordNumber() {
        SiteConfig config = getSiteConfig();
        if (config != null) {
            return config.getIcp_record_number();
        }
        return null;
    }

    @Override
    public String getMpsRecordNumber() {
        SiteConfig config = getSiteConfig();
        if (config != null) {
            return config.getMps_record_number();
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
                    cacheService.set("dimstack:site_config", config);
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
                cacheService.set("dimstack:site_config", siteConfig);
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("更新站点配置失败", e);
            return false;
        }
    }

    @Override
    public Integer getEnableRegister() {
        SiteConfig config = getSiteConfig();
        if (config != null) {
            return config.getEnable_register();
        }
        return null;
    }

    @Override
    public Integer getAdminPostNoReview() {
        SiteConfig config = getSiteConfig();
        if (config != null) {
            return config.getAdmin_post_no_review();
        }
        return null;
    }
}