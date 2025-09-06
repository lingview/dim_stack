package xyz.lingview.dimstack.service.impl;

import xyz.lingview.dimstack.domain.SiteConfig;
import xyz.lingview.dimstack.dto.HeroDTO;
import xyz.lingview.dimstack.mapper.SiteConfigMapper;
import xyz.lingview.dimstack.service.SiteConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SiteConfigServiceImpl implements SiteConfigService {

    @Autowired
    private SiteConfigMapper siteConfigMapper;

    @Override
    public SiteConfig getSiteConfig() {
        return siteConfigMapper.getSiteConfig();
    }

    @Override
    public HeroDTO getHeroConfig() {
        SiteConfig config = siteConfigMapper.getSiteConfig();
        if (config != null) {
            HeroDTO heroDTO = new HeroDTO();
            heroDTO.setTitle(config.getHero_title());
            heroDTO.setSubtitle(config.getHero_subtitle());
            heroDTO.setImage(config.getHero_image());
            return heroDTO;
        }
        return null;
    }
}
