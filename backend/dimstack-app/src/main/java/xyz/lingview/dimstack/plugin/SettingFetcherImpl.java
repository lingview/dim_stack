package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.plugin.api.SettingFetcher;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 插件配置读取实现
 * @Version: 1.0
 */
@Slf4j
@Service
public class SettingFetcherImpl implements SettingFetcher {

    @Override
    public <T> T fetch(String configMapName, String key, Class<T> clazz) {

        return null;
    }
}
