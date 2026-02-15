package xyz.lingview.dimstack.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import xyz.lingview.dimstack.service.CacheService;
import xyz.lingview.dimstack.domain.SiteConfig;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SiteConfigUtil {

    @Autowired
    private CacheService cacheService;

    /**
     * 从缓存中的dimstack:site_config获取指定字段的值
     * @param fieldKey 字段名
     * @return 字段值，如果不存在或出错则返回null
     */
    public String getSiteConfigField(String fieldKey) {
        try {
            SiteConfig siteConfig = cacheService.get("dimstack:site_config", SiteConfig.class);
            if (siteConfig != null) {
                switch (fieldKey) {
                    case "site_name":
                        return siteConfig.getSite_name();
                    case "copyright":
                        return siteConfig.getCopyright();
                    case "site_icon":
                        return siteConfig.getSite_icon();
                    default:
                        return null;
                }
            }
        } catch (Exception e) {
            log.warn("获取站点配置字段 {} 时发生异常", fieldKey, e);
        }
        return null;
    }

    /**
     * 从缓存中的dimstack:site_config获取站点名称
     * @return 站点名称，如果不存在或出错则返回null
     */
    public String getSiteName() {
        try {
            SiteConfig siteConfig = cacheService.get("dimstack:site_config", SiteConfig.class);
            return siteConfig != null ? siteConfig.getSite_name() : null;
        } catch (Exception e) {
            log.warn("获取站点名称时发生异常", e);
            return null;
        }
    }

    /**
     * 从缓存中的dimstack:site_config获取版权信息
     * @return 版权信息，如果不存在或出错则返回null
     */
    public String getCopyright() {
        try {
            SiteConfig siteConfig = cacheService.get("dimstack:site_config", SiteConfig.class);
            return siteConfig != null ? siteConfig.getCopyright() : null;
        } catch (Exception e) {
            log.warn("获取版权信息时发生异常", e);
            return null;
        }
    }

    /**
     * 从缓存中的dimstack:site_config获取站点图标
     * @return 站点图标URL，如果不存在或出错则返回null
     */
    public String getSiteIcon() {
        try {
            SiteConfig siteConfig = cacheService.get("dimstack:site_config", SiteConfig.class);
            return siteConfig != null ? siteConfig.getSite_icon() : null;
        } catch (Exception e) {
            log.warn("获取站点图标时发生异常", e);
            return null;
        }
    }

    /**
     * 从缓存中的dimstack:site_config获取是否启用通知
     * @return boolean值，如果不存在或出错则返回false
     */
    public boolean isNotificationEnabled() {
        try {
            SiteConfig siteConfig = cacheService.get("dimstack:site_config", SiteConfig.class);
            if (siteConfig != null) {
                Boolean enableNotification = siteConfig.getEnable_notification();
                return enableNotification != null && enableNotification;
            }
        } catch (Exception e) {
            log.warn("检查通知设置时发生异常", e);
        }
        return false;
    }


    /**
     * 从缓存中的dimstack:site_config获取是否启用用户注册
     * @return boolean值，如果不存在或出错则返回true（默认启用）
     */
    public boolean isRegisterEnabled() {
        try {
            SiteConfig siteConfig = cacheService.get("dimstack:site_config", SiteConfig.class);
            if (siteConfig != null) {
                Integer enableRegister = siteConfig.getEnable_register();
                return enableRegister == null || enableRegister == 1;
            }
        } catch (Exception e) {
            log.warn("检查注册设置时发生异常", e);
        }
        return true;
    }


    /**
     * 从缓存中的dimstack:site_config获取是否启用音乐播放器
     * @return boolean值，如果不存在或出错则返回false（默认不启用）
     */
    public boolean isMusicEnabled() {
        try {
            SiteConfig siteConfig = cacheService.get("dimstack:site_config", SiteConfig.class);
            if (siteConfig != null) {
                Integer enableMusic = siteConfig.getEnable_music();
                return enableMusic != null && enableMusic == 1;
            }
        } catch (Exception e) {
            log.warn("检查音乐设置时发生异常", e);
        }
        return false;
    }


    public boolean adminPostNoReview() {
        try {
            SiteConfig siteConfig = cacheService.get("dimstack:site_config", SiteConfig.class);
            if (siteConfig != null) {
                Integer adminPostNoReview = siteConfig.getAdmin_post_no_review();
                return adminPostNoReview != null && adminPostNoReview == 1;
            }
        } catch (Exception e) {
            log.warn("检查 admin_post_no_review 设置时发生异常", e);
        }
        return false;
    }
}
