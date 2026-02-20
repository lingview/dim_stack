package xyz.lingview.dimstack.controller.api.v1;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.util.DomainUtil;

@RestController
public class RobotsController {

    @GetMapping(value = "/robots.txt", produces = "text/plain;charset=UTF-8")
    public String robots(HttpServletRequest request) {

        String domain = DomainUtil.getFullDomain(request);

        StringBuilder sb = new StringBuilder();

        sb.append("User-agent: *\n");
        sb.append("Allow: /\n\n");

        sb.append("Disallow: /api/\n");
        sb.append("Disallow: /dashboard/\n");
        sb.append("Disallow: /login\n");
        sb.append("Disallow: /register\n");
        sb.append("Disallow: /admin/\n");

        sb.append("\nCrawl-delay: 2\n\n");

        sb.append("Sitemap: ").append(domain).append("/sitemap-index.xml");

        return sb.toString();
    }

}
