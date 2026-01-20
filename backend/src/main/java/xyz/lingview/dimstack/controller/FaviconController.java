package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import net.coobird.thumbnailator.Thumbnails;
import xyz.lingview.dimstack.mapper.SiteConfigMapper;

@Slf4j
@RestController
public class FaviconController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private SiteConfigMapper siteConfigMapper;

    @GetMapping(value = "/favicon.ico", produces = "image/png")
    public ResponseEntity<ByteArrayResource> getFavicon(HttpServletRequest request) throws IOException {
        String iconUrl = siteConfigMapper.getSiteIcon();
        if (iconUrl == null || iconUrl.trim().isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String targetUrl;

        if (iconUrl.startsWith("http://") || iconUrl.startsWith("https://")) {
            targetUrl = iconUrl;
        } else {
            String scheme = request.getScheme();
            String serverName = request.getServerName();
            int serverPort = request.getServerPort();

            StringBuilder baseUrl = new StringBuilder();
            baseUrl.append(scheme).append("://").append(serverName);
            if ((scheme.equals("http") && serverPort != 80) ||
                    (scheme.equals("https") && serverPort != 443)) {
                baseUrl.append(":").append(serverPort);
            }
            targetUrl = baseUrl.toString() + iconUrl;
        }

        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
            return ResponseEntity.badRequest().build();
        }

        try {
            byte[] imageBytes = restTemplate.getForObject(targetUrl, byte[].class);
            if (imageBytes == null || imageBytes.length == 0) {
                return ResponseEntity.notFound().build();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Thumbnails.of(new java.io.ByteArrayInputStream(imageBytes))
                    .size(32, 32)
                    .outputFormat("png")
                    .toOutputStream(baos);

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(new ByteArrayResource(baos.toByteArray()));

        } catch (Exception e) {
            log.error("站点图标转换失败: {}", targetUrl, e);
            return ResponseEntity.status(500).build();
        }
    }
}