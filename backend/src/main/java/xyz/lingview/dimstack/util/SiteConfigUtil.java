package xyz.lingview.dimstack.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonElement;

@Slf4j
@Component
public class SiteConfigUtil {

    @Autowired
    private StringRedisTemplate redisTemplate;

    /**
     * 从Redis中的dimstack:site_config获取指定字段的值
     * @param fieldKey 字段名
     * @return 字段值，如果不存在或出错则返回null
     */
    public String getSiteConfigField(String fieldKey) {
        try {
            String siteConfigJson = redisTemplate.opsForValue().get("dimstack:site_config");
            if (siteConfigJson != null) {
                JsonObject jsonObject = JsonParser.parseString(siteConfigJson).getAsJsonObject();
                JsonElement fieldElement = jsonObject.get(fieldKey);

                if (fieldElement != null && fieldElement.isJsonPrimitive()) {
                    return fieldElement.getAsString();
                }
            }
        } catch (Exception e) {
            log.warn("获取站点配置字段 {} 时发生异常", fieldKey, e);
        }
        return null;
    }

    /**
     * 从Redis中的dimstack:site_config获取站点名称
     * @return 站点名称，如果不存在或出错则返回null
     */
    public String getSiteName() {
        return getSiteConfigField("site_name");
    }

    /**
     * 从Redis中的dimstack:site_config获取版权信息
     * @return 版权信息，如果不存在或出错则返回null
     */
    public String getCopyright() {
        return getSiteConfigField("copyright");
    }

    /**
     * 从Redis中的dimstack:site_config获取站点图标
     * @return 站点图标URL，如果不存在或出错则返回null
     */
    public String getSiteIcon() {
        return getSiteConfigField("site_icon");
    }

    /**
     * 从Redis中的dimstack:site_config获取是否启用通知
     * @return boolean值，如果不存在或出错则返回false
     */
    public boolean isNotificationEnabled() {
        try {
            String siteConfigJson = redisTemplate.opsForValue().get("dimstack:site_config");
            if (siteConfigJson != null) {
                JsonObject jsonObject = JsonParser.parseString(siteConfigJson).getAsJsonObject();
                JsonElement enableNotificationElement = jsonObject.get("enable_notification");

                if (enableNotificationElement != null && enableNotificationElement.isJsonPrimitive()) {
                    return enableNotificationElement.getAsBoolean();
                }
            }
        } catch (Exception e) {
            log.warn("检查通知设置时发生异常", e);
        }
        return false;
    }


    /**
     * 从Redis中的dimstack:site_config获取是否启用用户注册
     * @return boolean值，如果不存在或出错则返回true（默认启用）
     */
    public boolean isRegisterEnabled() {
        try {
            String siteConfigJson = redisTemplate.opsForValue().get("dimstack:site_config");
            if (siteConfigJson != null) {
                JsonObject jsonObject = JsonParser.parseString(siteConfigJson).getAsJsonObject();
                JsonElement enableRegisterElement = jsonObject.get("enable_register");

                if (enableRegisterElement != null && enableRegisterElement.isJsonPrimitive()) {
                    return enableRegisterElement.getAsInt() == 1;
                }
            }
        } catch (Exception e) {
            log.warn("检查注册设置时发生异常", e);
        }
        return true;
    }


    /**
     * 从Redis中的dimstack:site_config获取是否启用音乐播放器
     * @return boolean值，如果不存在或出错则返回false（默认不启用）
     */
    public boolean isMusicEnabled() {
        try {
            String siteConfigJson = redisTemplate.opsForValue().get("dimstack:site_config");
            if (siteConfigJson != null) {
                JsonObject jsonObject = JsonParser.parseString(siteConfigJson).getAsJsonObject();
                JsonElement enableMusicElement = jsonObject.get("enable_music");

                if (enableMusicElement != null && enableMusicElement.isJsonPrimitive()) {
                    return enableMusicElement.getAsInt() == 1;
                }
            }
        } catch (Exception e) {
            log.warn("检查音乐设置时发生异常", e);
        }
        return false;
    }
}
