package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.SiteConfig;
import xyz.lingview.dimstack.dto.HeroDTO;

public interface SiteConfigService {
    SiteConfig getSiteConfig();
    HeroDTO getHeroConfig();
    String getCopyright();
    String getSiteName();
    String getSiteIcon();
    boolean updateSiteConfig(SiteConfig siteConfig);
}
