package xyz.lingview.dimstack.controller.api.v1;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.servlet.ModelAndView;
import xyz.lingview.dimstack.domain.SiteConfig;
import xyz.lingview.dimstack.dto.request.ArticleDTO;
import xyz.lingview.dimstack.dto.request.PageRequest;
import xyz.lingview.dimstack.dto.request.PageResult;
import xyz.lingview.dimstack.service.ArticleService;
import xyz.lingview.dimstack.service.SiteConfigService;
import xyz.lingview.dimstack.util.DomainUtil;
import xyz.lingview.dimstack.util.UrlUtil;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2025/12/09 17:04:05
 * @Description: 首页ssr
 * @Version: 1.0
 */
@Slf4j
@Controller
public class HomePageController {

    @Autowired
    private ArticleService articleService;

    @Autowired
    private SiteConfigService siteConfigService;

    private static final List<String> BOT_UA = List.of(
            "Googlebot", "Bingbot", "Baiduspider", "DuckDuckBot", "Sogou", "360Spider",
            "YisouSpider", "ByteSpider"
    );

    private boolean isBot(String ua) {
        if (ua == null) return false;
        String uaLower = ua.toLowerCase();
        return BOT_UA.stream().anyMatch(bot -> uaLower.contains(bot.toLowerCase()));
    }

    @GetMapping("/")
    public Object homePageForSEO(
            @RequestHeader(value = "User-Agent", required = false) String ua,
            HttpServletRequest request
    ) {
        log.info("访问首页 UA={}", ua);

        boolean bot = isBot(ua);

        if (bot) {
            try {
                PageRequest pageRequest = new PageRequest();
                pageRequest.setPage(1);
                pageRequest.setSize(6);

                PageResult<ArticleDTO> articleResult = articleService.getArticlesForHomePage(pageRequest);
                List<ArticleDTO> articles = articleResult.getData();

                SiteConfig siteConfig = siteConfigService.getSiteConfig();

                String domain = DomainUtil.getFullDomain(request);
                String url = domain + "/";

                ModelAndView mv = new ModelAndView("seo_home");
                mv.addObject("articles", articles);
                mv.addObject("siteName", siteConfig.getSite_name());
                mv.addObject("siteDescription", siteConfig.getCopyright());
                mv.addObject("siteIcon", UrlUtil.getFullUrl(domain, siteConfig.getSite_icon()));
                mv.addObject("url", url);
                mv.addObject("domain", domain);

                return mv;
            } catch (Exception e) {
                log.error("生成首页SEO页面时出错", e);
                return new ModelAndView("seo_404");
            }
        }

        return "forward:/index.html";
    }

}
