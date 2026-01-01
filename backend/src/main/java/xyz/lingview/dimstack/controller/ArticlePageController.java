package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpServletRequest;
import xyz.lingview.dimstack.domain.ReadArticle;
import xyz.lingview.dimstack.domain.SiteConfig;
import xyz.lingview.dimstack.service.ReadArticleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.servlet.ModelAndView;
import xyz.lingview.dimstack.service.SiteConfigService;
import xyz.lingview.dimstack.util.DomainUtil;
import xyz.lingview.dimstack.util.UrlUtil;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2025/11/16 10:37:17
 * @Description: 文章页ssr
 * @Version: 1.0
 */
@Slf4j
@Controller
public class ArticlePageController {

    @Autowired
    private ReadArticleService readArticleService;

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

    @GetMapping("/article/{alias}")
    public Object articleForSEO(
            @PathVariable String alias,
            @RequestHeader(value = "User-Agent", required = false) String ua,
            HttpServletRequest request
    ) {
        log.info("访问文章 {} UA={}", alias, ua);

        boolean bot = isBot(ua);

        if (bot) {
            try {
                ReadArticle article = readArticleService.getArticleByAlias(alias, null);
                SiteConfig siteConfig = siteConfigService.getSiteConfig();

                String domain = DomainUtil.getFullDomain(request);
                String url = domain + "/article/" + alias;

                ModelAndView mv = new ModelAndView("seo_article");
                mv.addObject("title", article.getArticle_name());
                mv.addObject("excerpt", article.getExcerpt());
                mv.addObject("content", article.getArticle_content());
                mv.addObject("date", article.getCreate_time());
                mv.addObject("tag", article.getTag());

                mv.addObject("url", url);
                mv.addObject("domain", domain);
                mv.addObject("siteIcon", UrlUtil.getFullUrl(domain, siteConfig.getSite_icon()));


                return mv;

            } catch (Exception e) {
                return new ModelAndView("seo_404");
            }
        }

        return "forward:/index.html";
    }

}