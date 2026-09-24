package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.pf4j.PluginState;
import org.pf4j.PluginWrapper;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.web.util.UriUtils;
import xyz.lingview.dimstack.domain.PluginInfo;
import xyz.lingview.dimstack.mapper.PluginMapper;

/**
 * @Author: lingview
 * @Date: 2026/08/14 20:47:33
 * @Description: 插件前端信息聚合
 * @Version: 1.0
 */
@Slf4j
@Service
public class UiPluginBundleServiceImpl implements UiPluginBundleService {

    private static final String MANIFEST_FILE = "ui/ui-plugin.json";

    private final DimStackPluginManager pluginManager;
    private final PluginMapper pluginMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public UiPluginBundleServiceImpl(DimStackPluginManager pluginManager, PluginMapper pluginMapper) {
        this.pluginManager = pluginManager;
        this.pluginMapper = pluginMapper;
    }

    @Override
    public List<UiPluginProviderDescriptor> listProviders() {
        List<UiPluginProviderDescriptor> providers = new ArrayList<>();
        for (PluginWrapper wrapper : pluginManager.getPlugins()) {
            if (wrapper.getPluginState() != PluginState.STARTED) {
                continue;
            }
            UiPluginProviderDescriptor descriptor = buildProvider(wrapper);
            if (descriptor != null) {
                providers.add(descriptor);
            }
        }
        return providers;
    }

    private UiPluginProviderDescriptor buildProvider(PluginWrapper wrapper) {
        InputStream in = wrapper.getPluginClassLoader().getResourceAsStream(MANIFEST_FILE);
        if (in == null) {
            return null;
        }
        try (in) {
            UiPluginProviderDescriptor.UiPluginManifest manifest =
                    objectMapper.readValue(in, UiPluginProviderDescriptor.UiPluginManifest.class);
            if (manifest == null || !"esm".equals(manifest.getFormat())
                    || manifest.getEntry() == null || manifest.getEntry().isBlank()) {
                log.warn("插件 {} 的 ui-plugin.json 无效(格式非 esm 或缺少 entry), 已忽略", wrapper.getPluginId());
                return null;
            }

            if (!isSafeAssetPath(manifest.getEntry()) || !hasSuffix(manifest.getEntry(), ENTRY_SUFFIXES)) {
                log.warn("插件 {} 的 ui 入口非法(仅支持 .js/.mjs 且路径字符受限), 已忽略", wrapper.getPluginId());
                return null;
            }
            if (manifest.getStyle() != null && !manifest.getStyle().isBlank()
                    && (!isSafeAssetPath(manifest.getStyle()) || !hasSuffix(manifest.getStyle(), STYLE_SUFFIXES))) {
                log.warn("插件 {} 的 ui 样式非法(仅支持 .css 且路径字符受限), 已忽略", wrapper.getPluginId());
                return null;
            }

            String idSegment = UriUtils.encodePathSegment(wrapper.getPluginId(), StandardCharsets.UTF_8);
            UiPluginProviderDescriptor descriptor = new UiPluginProviderDescriptor();
            descriptor.setName(wrapper.getPluginId());
            descriptor.setVersion(wrapper.getDescriptor().getVersion());
            descriptor.setAssetHash(resolveAssetHash(wrapper.getPluginId()));
            descriptor.setManifest(manifest);
            descriptor.setEntryUrl("/plugins/" + idSegment + "/assets/ui/" + manifest.getEntry());
            if (manifest.getStyle() != null && !manifest.getStyle().isBlank()) {
                descriptor.setStyleUrl("/plugins/" + idSegment + "/assets/ui/" + manifest.getStyle());
            }
            return descriptor;
        } catch (Exception e) {
            log.warn("插件 {} 的 ui-plugin.json 解析失败, 已忽略", wrapper.getPluginId(), e);
            return null;
        }
    }

    private String resolveAssetHash(String pluginId) {
        try {
            PluginInfo info = pluginMapper.selectByName(pluginId);
            return info != null ? info.getSha256() : null;
        } catch (Exception e) {
            log.warn("读取插件 {} 的内容指纹失败, 前端将回退用版本号做缓存键: {}", pluginId, e.getMessage());
            return null;
        }
    }

    private static final Pattern SAFE_ASSET_PATH = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._/-]*");

    private static final Set<String> ENTRY_SUFFIXES = Set.of(".js", ".mjs");
    private static final Set<String> STYLE_SUFFIXES = Set.of(".css");

    private boolean isSafeAssetPath(String path) {
        if (path == null || !SAFE_ASSET_PATH.matcher(path).matches() || path.contains("..")) {
            return false;
        }
        return true;
    }

    private boolean hasSuffix(String path, Set<String> suffixes) {
        String lower = path.toLowerCase();
        return suffixes.stream().anyMatch(lower::endsWith);
    }
}
