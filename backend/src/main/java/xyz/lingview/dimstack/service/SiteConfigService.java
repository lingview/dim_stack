// xyz.lingview.dimstack.service.SiteConfigService
package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.SiteConfig;
import xyz.lingview.dimstack.dto.request.HeroDTO;

public interface SiteConfigService {
    SiteConfig getSiteConfig();
    HeroDTO getHeroConfig();
    String getCopyright();
    String getSiteName();
    String getSiteIcon();
    String getSiteTheme();
    String getExpansionServer(); // 新增方法
    boolean updateSiteConfig(SiteConfig siteConfig);
    boolean updateSiteTheme(String themeName);
}
