package xyz.lingview.dimstack.controller.api.v1;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.util.regex.Pattern;

/**
 * @Author: lingview
 * @Date: 2026/01/20 10:36:14
 * @Description: 代理资源下载
 * @Version: 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/proxy")
public class ProxyController {

    private static final Pattern URL_PATTERN = Pattern.compile(
        "^https?://[a-zA-Z0-9][a-zA-Z0-9\\-]{1,61}[a-zA-Z0-9](\\.[a-zA-Z0-9][a-zA-Z0-9\\-]{1,61}[a-zA-Z0-9])*(:\\d+)?(/.*)?$"
    );

    @GetMapping("/favicon")
    public ResponseEntity<byte[]> getFavicon(@RequestParam String url) {
        if (!isValidUrl(url)) {
            log.warn("无效的URL: {}", url);
            return ResponseEntity.badRequest().build();
        }

        try {
            if (!isFaviconUrl(url)) {
                log.warn("不是favicon URL: {}", url);
                return ResponseEntity.badRequest().build();
            }

            URL imageUrl = new URL(url);
            URLConnection connection = imageUrl.openConnection();

            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (compatible; favicon-fetcher)");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(10000);
            connection.setDoInput(true);

            byte[] imageBytes = connection.getInputStream().readAllBytes();
            String contentType = connection.getContentType();

            if (!contentType.startsWith("image/")) {
                log.warn("URL {} 不返回图像内容: {}", url, contentType);
                return ResponseEntity.unprocessableEntity().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf(contentType));
            headers.setContentLength(imageBytes.length);
            headers.setCacheControl("max-age=3600");

            log.info("成功获取网站图标: {}", url);
            return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            log.error("获取网站图标失败: {}", url, e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        } catch (Exception e) {
            log.error("获取网站图标发生未知错误: {}", url, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private boolean isValidUrl(String url) {
        if (!StringUtils.hasText(url)) {
            return false;
        }
        return URL_PATTERN.matcher(url).matches();
    }


    private boolean isFaviconUrl(String url) {
        return url.endsWith("/favicon.ico") ||
                url.endsWith("/favicon.png") ||
                url.endsWith("/apple-touch-icon.png") ||
                url.endsWith("/apple-touch-icon-precomposed.png") ||
                url.contains("/favicon") ||
                url.contains("touch-icon");
    }
}
