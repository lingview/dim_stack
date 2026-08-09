package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import xyz.lingview.dimstack.mapper.PluginConfigMapper;
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

    private static final String CONFIG_KEY = "config";

    private final PluginConfigMapper configMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SettingFetcherImpl(PluginConfigMapper configMapper) {
        this.configMapper = configMapper;
    }

    @Override
    public <T> T fetch(String pluginName, String key, Class<T> clazz) {
        String json = configMapper.selectValue(pluginName, CONFIG_KEY);
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode node = root.get(key);
            if (node == null || node.isNull()) {
                return null;
            }
            return objectMapper.treeToValue(node, clazz);
        } catch (Exception e) {
            log.warn("插件配置读取失败: plugin={}, key={}", pluginName, key, e);
            return null;
        }
    }
}
