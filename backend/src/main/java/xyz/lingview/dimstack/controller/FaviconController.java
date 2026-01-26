package xyz.lingview.dimstack.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;

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
            if (("http".equals(scheme) && serverPort != 80) ||
                    ("https".equals(scheme) && serverPort != 443)) {
                baseUrl.append(":").append(serverPort);
            }
            targetUrl = baseUrl.toString() + iconUrl;
        }

        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
            log.warn("无效的图标 URL 协议: {}", targetUrl);
            return ResponseEntity.badRequest().build();
        }

        URI uri;
        try {
            uri = URI.create(targetUrl);
        } catch (IllegalArgumentException e) {
            log.error("图标 URL 格式非法，无法构造 URI: {}", targetUrl, e);
            return ResponseEntity.badRequest().build();
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<byte[]> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    entity,
                    byte[].class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.warn("获取图标失败，HTTP {}: {}", response.getStatusCode(), targetUrl);
                return ResponseEntity.status(response.getStatusCode()).build();
            }

            byte[] imageBytes = response.getBody();
            if (imageBytes == null || imageBytes.length == 0) {
                log.warn("图标内容为空: {}", targetUrl);
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}