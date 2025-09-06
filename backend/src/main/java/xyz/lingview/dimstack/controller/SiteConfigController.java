package xyz.lingview.dimstack.controller;

import xyz.lingview.dimstack.dto.HeroDTO;
import xyz.lingview.dimstack.service.SiteConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/site")
public class SiteConfigController {

    @Autowired
    private SiteConfigService siteConfigService;

    @GetMapping("/hero")
    public HeroDTO getHeroConfig() {
        return siteConfigService.getHeroConfig();
    }

    @GetMapping("/copyright")
    public String getCopyright() {
        return siteConfigService.getCopyright();
    }

    @GetMapping("/name")
    public String getSiteName() {
        return siteConfigService.getSiteName();
    }
}
