package xyz.lingview.dimstack.plugin;

import lombok.extern.slf4j.Slf4j;
import org.pf4j.PluginState;
import org.pf4j.PluginWrapper;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

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
    private final ObjectMapper objectMapper = new ObjectMapper();

    public UiPluginBundleServiceImpl(DimStackPluginManager pluginManager) {
        this.pluginManager = pluginManager;
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

            if (!isSafeAssetPath(manifest.getEntry()) || (manifest.getStyle() != null && !isSafeAssetPath(manifest.getStyle()))) {
                log.warn("插件 {} 的 ui 资源路径非法, 已忽略", wrapper.getPluginId());
                return null;
            }

            UiPluginProviderDescriptor descriptor = new UiPluginProviderDescriptor();
            descriptor.setName(wrapper.getPluginId());
            descriptor.setVersion(wrapper.getDescriptor().getVersion());
            descriptor.setManifest(manifest);
            descriptor.setEntryUrl("/plugins/" + wrapper.getPluginId() + "/assets/ui/" + manifest.getEntry());
            if (manifest.getStyle() != null && !manifest.getStyle().isBlank()) {
                descriptor.setStyleUrl("/plugins/" + wrapper.getPluginId() + "/assets/ui/" + manifest.getStyle());
            }
            return descriptor;
        } catch (Exception e) {
            log.warn("插件 {} 的 ui-plugin.json 解析失败, 已忽略", wrapper.getPluginId(), e);
            return null;
        }
    }

    private boolean isSafeAssetPath(String path) {
        if (path == null || path.isBlank() || path.contains("..") || path.startsWith("/")
                || path.contains("://") || path.contains("\\")) {
            return false;
        }
        return true;
    }
}
