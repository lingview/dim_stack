package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.pf4j.PluginState;
import org.pf4j.PluginWrapper;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.HandlerMapping;

import jakarta.servlet.http.HttpServletRequest;
import java.io.InputStream;
import java.nio.file.Path;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 插件前端资源接口
 * @Version: 1.0
 */
@Slf4j
@RestController
public class PluginAssetController {

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();
    private static final String ASSET_PATTERN = "/plugins/{name}/assets/ui/**";

    private final DimStackPluginManager pluginManager;

    public PluginAssetController(DimStackPluginManager pluginManager) {
        this.pluginManager = pluginManager;
    }

    @GetMapping(ASSET_PATTERN)
    public ResponseEntity<Resource> asset(@PathVariable String name, HttpServletRequest request) {
        PluginWrapper wrapper = pluginManager.getPlugin(name);
        if (wrapper == null || wrapper.getPluginState() != PluginState.STARTED) {
            return ResponseEntity.notFound().build();
        }


        String relative = PATH_MATCHER.extractPathWithinPattern(ASSET_PATTERN, request.getRequestURI());
        String normalized;
        try {
            Path path = Path.of(relative).normalize();
            normalized = path.toString().replace('\\', '/');
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }

        if (normalized.isEmpty() || normalized.startsWith("../") || normalized.startsWith("/")) {
            log.warn("插件资源路径被拒绝: /plugins/{}/assets/ui/{}", name, relative);
            return ResponseEntity.badRequest().build();
        }

        String resourcePath = "ui/" + normalized;
        InputStream in = wrapper.getPluginClassLoader().getResourceAsStream(resourcePath);
        if (in == null) {
            return ResponseEntity.notFound().build();
        }
        MediaType mediaType = guessMediaType(resourcePath);
        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(new InputStreamResource(in));
    }

    private MediaType guessMediaType(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".js")) return MediaType.valueOf("text/javascript");
        if (lower.endsWith(".css")) return MediaType.valueOf("text/css");
        if (lower.endsWith(".json")) return MediaType.APPLICATION_JSON;
        if (lower.endsWith(".svg")) return MediaType.valueOf("image/svg+xml");
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (lower.endsWith(".gif")) return MediaType.IMAGE_GIF;
        if (lower.endsWith(".woff2")) return MediaType.valueOf("font/woff2");
        if (lower.endsWith(".woff")) return MediaType.valueOf("font/woff");
        if (lower.endsWith(".ttf")) return MediaType.valueOf("font/ttf");
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
