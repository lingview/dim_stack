package xyz.lingview.dimstack.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import xyz.lingview.dimstack.annotation.RequiresPermission;
import xyz.lingview.dimstack.common.ApiResponse;
import xyz.lingview.dimstack.service.CacheService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/cache")
public class CacheManagementController {

    @Autowired
    private CacheService cacheService;

    @PostMapping("/clear/all")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, Object>> clearAllCache() {
        log.info("执行清除所有缓存操作");
        try {
            String[] cacheKeys = {
                "dimstack:site_config",
                "dimstack:user:blacklist",
                "dimstack:hot_articles",
                "dimstack:sitemap:articles",
                "dimstack:sitemap:categories",
                "dimstack:llm_config",
                "dimstack:sitemap:tags"
            };

            for (String key : cacheKeys) {
                cacheService.delete(key);
                log.info("已清除缓存: {}", key);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("clearedKeys", cacheKeys);
            result.put("count", cacheKeys.length);

            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("清除所有缓存失败", e);
            return ApiResponse.error(500, "清除缓存失败: " + e.getMessage());
        }
    }

    @PostMapping("/clear/article")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, Object>> clearArticleCache(@RequestBody(required = false) Map<String, String> request) {
        log.info("执行清除文章缓存操作");
        try {
            if (request != null && request.containsKey("alias")) {
                String alias = request.get("alias");
                if (alias == null || alias.trim().isEmpty()) {
                    return ApiResponse.error(400, "文章别名不能为空");
                }
                
                String cacheKey = "dimstack:article:" + alias;
                cacheService.delete(cacheKey);
                log.info("已清除文章缓存: {}, 别名: {}", cacheKey, alias);

                Map<String, Object> result = new HashMap<>();
                result.put("clearedKey", cacheKey);
                result.put("alias", alias);

                return ApiResponse.success(result);
            } else {
                cacheService.deleteByPrefix("dimstack:article:");
                log.info("已清除所有文章缓存");

                Map<String, Object> result = new HashMap<>();
                result.put("message", "已清除所有文章缓存");

                return ApiResponse.success(result);
            }
        } catch (Exception e) {
            log.error("清除文章缓存失败", e);
            return ApiResponse.error(500, "清除文章缓存失败: " + e.getMessage());
        }
    }

    @PostMapping("/clear/site-config")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, Object>> clearSiteConfigCache() {
        log.info("执行清除站点配置缓存操作");
        try {
            cacheService.delete("dimstack:site_config");
            log.info("已清除站点配置缓存");

            Map<String, Object> result = new HashMap<>();
            result.put("clearedKey", "dimstack:site_config");

            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("清除站点配置缓存失败", e);
            return ApiResponse.error(500, "清除站点配置缓存失败: " + e.getMessage());
        }
    }

    @PostMapping("/clear/user-blacklist")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, Object>> clearUserBlacklistCache() {
        log.info("执行清除用户黑名单缓存操作");
        try {
            cacheService.deleteSet("dimstack:user:blacklist");
            log.info("已清除用户黑名单缓存");

            Map<String, Object> result = new HashMap<>();
            result.put("clearedKey", "dimstack:user:blacklist");

            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("清除用户黑名单缓存失败", e);
            return ApiResponse.error(500, "清除用户黑名单缓存失败: " + e.getMessage());
        }
    }

    @PostMapping("/clear/hot-articles")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, Object>> clearHotArticlesCache() {
        log.info("执行清除热门文章缓存操作");
        try {
            cacheService.delete("dimstack:hot_articles");
            log.info("已清除热门文章缓存");

            Map<String, Object> result = new HashMap<>();
            result.put("clearedKey", "dimstack:hot_articles");

            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("清除热门文章缓存失败", e);
            return ApiResponse.error(500, "清除热门文章缓存失败: " + e.getMessage());
        }
    }

    @PostMapping("/clear/sitemap/articles")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, Object>> clearSitemapArticlesCache() {
        log.info("执行清除站点地图文章缓存操作");
        try {
            cacheService.delete("dimstack:sitemap:articles");
            log.info("已清除站点地图文章缓存");

            Map<String, Object> result = new HashMap<>();
            result.put("clearedKey", "dimstack:sitemap:articles");

            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("清除站点地图文章缓存失败", e);
            return ApiResponse.error(500, "清除站点地图文章缓存失败: " + e.getMessage());
        }
    }

    @PostMapping("/clear/sitemap/categories")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, Object>> clearSitemapCategoriesCache() {
        log.info("执行清除站点地图分类缓存操作");
        try {
            cacheService.delete("dimstack:sitemap:categories");
            log.info("已清除站点地图分类缓存");

            Map<String, Object> result = new HashMap<>();
            result.put("clearedKey", "dimstack:sitemap:categories");

            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("清除站点地图分类缓存失败", e);
            return ApiResponse.error(500, "清除站点地图分类缓存失败: " + e.getMessage());
        }
    }

    @PostMapping("/clear/llm-config")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, Object>> clearLlmConfigCache() {
        log.info("执行清除LLM配置缓存操作");
        try {
            cacheService.delete("dimstack:llm_config");
            log.info("已清除LLM配置缓存");

            Map<String, Object> result = new HashMap<>();
            result.put("clearedKey", "dimstack:llm_config");

            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("清除LLM配置缓存失败", e);
            return ApiResponse.error(500, "清除LLM配置缓存失败: " + e.getMessage());
        }
    }

    @PostMapping("/clear/sitemap/tags")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, Object>> clearSitemapTagsCache() {
        log.info("执行清除站点地图标签缓存操作");
        try {
            cacheService.delete("dimstack:sitemap:tags");
            log.info("已清除站点地图标签缓存");

            Map<String, Object> result = new HashMap<>();
            result.put("clearedKey", "dimstack:sitemap:tags");

            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("清除站点地图标签缓存失败", e);
            return ApiResponse.error(500, "清除站点地图标签缓存失败: " + e.getMessage());
        }
    }

    @PostMapping("/clear/batch")
    @RequiresPermission("system:config:management")
    public ApiResponse<Map<String, Object>> clearBatchCache(@RequestBody Map<String, List<String>> request) {
        log.info("执行批量清除缓存操作");
        try {
            List<String> cacheKeys = request.get("keys");
            if (cacheKeys == null || cacheKeys.isEmpty()) {
                return ApiResponse.error(400, "请指定要清除的缓存键");
            }

            List<String> clearedKeys = new java.util.ArrayList<>();
            for (String key : cacheKeys) {
                if (key.endsWith(":")) {
                    cacheService.deleteByPrefix(key);
                    clearedKeys.add(key + "*");
                    log.info("已清除以 {} 开头的所有缓存", key);
                } else {
                    cacheService.delete(key);
                    clearedKeys.add(key);
                    log.info("已清除缓存: {}", key);
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("clearedKeys", clearedKeys);
            result.put("count", clearedKeys.size());

            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("批量清除缓存失败", e);
            return ApiResponse.error(500, "批量清除缓存失败: " + e.getMessage());
        }
    }
}
