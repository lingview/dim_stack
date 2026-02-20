package xyz.lingview.dimstack.controller.api.v1;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.domain.ReadArticle;
import xyz.lingview.dimstack.service.ReadArticleService;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class SitemapController {

    private final ReadArticleService readArticleService;

    private String getDomain(HttpServletRequest request) {
        String scheme = request.getHeader("X-Forwarded-Proto");
        if (scheme == null) scheme = request.getScheme();

        String host = request.getHeader("X-Forwarded-Host");
        if (host == null)
            host = request.getServerName() +
                    ((request.getServerPort() == 80 || request.getServerPort() == 443)
                            ? "" : ":" + request.getServerPort());

        return scheme + "://" + host;
    }

    @GetMapping(value = "/sitemap-index.xml", produces = "application/xml;charset=UTF-8")
    public String sitemapIndex(HttpServletRequest request) {
        String domain = getDomain(request);

        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                    <sitemap>
                        <loc>%s/sitemap.xml</loc>
                    </sitemap>
                    <sitemap>
                        <loc>%s/sitemap-article.xml</loc>
                    </sitemap>
                    <sitemap>
                        <loc>%s/sitemap-category.xml</loc>
                    </sitemap>
                    <sitemap>
                        <loc>%s/sitemap-tag.xml</loc>
                    </sitemap>
                </sitemapindex>
                """.formatted(domain, domain, domain, domain);
    }

    @GetMapping(value = "/sitemap.xml", produces = "application/xml;charset=UTF-8")
    public String sitemap(HttpServletRequest request) {
        String domain = getDomain(request);

        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                    %s
                </urlset>
                """.formatted(
                buildUrl(domain + "/", "daily", "1.0", null)
        );
    }

    @GetMapping(value = "/sitemap-article.xml", produces = "application/xml;charset=UTF-8")
    public String sitemapArticle(HttpServletRequest request) {

        String domain = getDomain(request);
        List<ReadArticle> articles = readArticleService.listAllArticles();

        StringBuilder xml = new StringBuilder("""
                <?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                """);

        for (ReadArticle a : articles) {
            xml.append(buildUrl(
                    domain + "/article/" + url(a.getAlias()),
                    "weekly",
                    "0.9",
                    a.getCreate_time()
            ));
        }

        xml.append("</urlset>");

        return xml.toString();
    }

    @GetMapping(value = "/sitemap-category.xml", produces = "application/xml;charset=UTF-8")
    public String sitemapCategory(HttpServletRequest request) {

        String domain = getDomain(request);
        List<String> categories = readArticleService.listAllCategories();

        StringBuilder xml = new StringBuilder("""
                <?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                """);

        for (String c : categories) {
            xml.append(buildUrl(
                    domain + "/category/" + url(c),
                    "weekly",
                    "0.6",
                    null
            ));
        }

        xml.append("</urlset>");

        return xml.toString();
    }

    @GetMapping(value = "/sitemap-tag.xml", produces = "application/xml;charset=UTF-8")
    public String sitemapTag(HttpServletRequest request) {

        String domain = getDomain(request);
        List<String> tags = readArticleService.listAllTags();

        StringBuilder xml = new StringBuilder("""
                <?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                """);

        for (String t : tags) {
            xml.append(buildUrl(
                    domain + "/tag/" + url(t),
                    "weekly",
                    "0.5",
                    null
            ));
        }

        xml.append("</urlset>");

        return xml.toString();
    }

    private String buildUrl(String loc, String changefreq, String priority, Date lastmod) {

        StringBuilder sb = new StringBuilder();
        sb.append("<url>");
        sb.append("<loc>").append(loc).append("</loc>");
        sb.append("<changefreq>").append(changefreq).append("</changefreq>");
        sb.append("<priority>").append(priority).append("</priority>");

        if (lastmod != null) {
            LocalDateTime ldt = toLocalDateTime(lastmod);
            String formatted = ldt.atOffset(ZoneOffset.ofHours(8))
                    .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            sb.append("<lastmod>").append(formatted).append("</lastmod>");
        }

        sb.append("</url>");

        return sb.toString();
    }

    private String url(String s) {
        if (s == null) return "";
        return URLEncoder.encode(s, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private LocalDateTime toLocalDateTime(Date date) {
        if (date == null) return null;
        return date.toInstant()
                .atZone(ZoneOffset.ofHours(8))
                .toLocalDateTime();
    }
}
