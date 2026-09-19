package xyz.lingview.dimstack.plugin;

import org.yaml.snakeyaml.LoaderOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.SafeConstructor;

import java.io.InputStream;
import java.util.Collections;
import java.util.Map;

// 插件jar内的yaml属不受信任输入: SafeConstructor禁!!任意类实例化, 并限制码点数与别名数; Yaml非线程安全, 故每次新建
/**
 * @Author: lingview
 * @Date: 2026/09/19 20:33:56
 * @Description: 插件YAML安全加载
 * @Version: 1.0
 */
public final class PluginYamlLoader {

    private static final int MAX_CODE_POINTS = 1_048_576;
    private static final int MAX_ALIASES_FOR_COLLECTIONS = 50;

    private PluginYamlLoader() {
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> load(InputStream in) {
        LoaderOptions options = new LoaderOptions();
        options.setCodePointLimit(MAX_CODE_POINTS);
        options.setMaxAliasesForCollections(MAX_ALIASES_FOR_COLLECTIONS);
        Object loaded = new Yaml(new SafeConstructor(options)).load(in);
        return loaded instanceof Map<?, ?> map ? (Map<String, Object>) map : Collections.emptyMap();
    }
}
