package xyz.lingview.dimstack.plugin;

import org.pf4j.DefaultPluginDescriptor;
import org.pf4j.PluginDescriptor;
import org.pf4j.PluginDescriptorFinder;
import org.pf4j.PluginRuntimeException;
import org.pf4j.util.StringUtils;
import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.jar.JarFile;
import java.util.zip.ZipEntry;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 插件描述文件解析
 * @Version: 1.0
 */
public class YamlPluginDescriptorFinder implements PluginDescriptorFinder {

    private static final String DESCRIPTOR_FILE = "plugin.yaml";

    private final Map<String, PluginManifest> manifests = new ConcurrentHashMap<>();

    @Override
    public boolean isApplicable(Path pluginPath) {
        return true;
    }

    @Override
    public PluginDescriptor find(Path pluginPath) {
        Map<String, Object> data = readDescriptor(pluginPath);
        PluginManifest manifest = parseManifest(data);

        if (StringUtils.isNullOrEmpty(manifest.getId()) || StringUtils.isNullOrEmpty(manifest.getVersion())) {
            throw new PluginRuntimeException("plugin.yaml 缺少必填字段 id/version: " + pluginPath);
        }
        if (StringUtils.isNullOrEmpty(manifest.getDisplayName())) {
            throw new PluginRuntimeException("plugin.yaml 缺少必填字段 displayName: " + pluginPath);
        }

        // pf4j3.15构造器参数顺序: (pluginId, description, pluginClass, version, requires, provider, license)
        DefaultPluginDescriptor descriptor = new DefaultPluginDescriptor(
                manifest.getId(),
                manifest.getDescription(),
                manifest.getPluginClass(),
                manifest.getVersion(),
                manifest.getRequires(),
                manifest.getAuthor(),
                null);

        manifests.put(manifest.getId(), manifest);
        return descriptor;
    }

    public PluginManifest getManifest(String pluginId) {
        return manifests.get(pluginId);
    }

    public void removeManifest(String pluginId) {
        manifests.remove(pluginId);
    }

    private PluginManifest parseManifest(Map<String, Object> data) {
        PluginManifest manifest = new PluginManifest();
        manifest.setId(toString(data.get("id")));
        manifest.setVersion(toString(data.get("version")));
        manifest.setRequires(toString(data.get("requires")));
        manifest.setDisplayName(toString(data.get("displayName")));
        manifest.setDescription(toString(data.get("description")));
        manifest.setAuthor(parseAuthor(data.get("author")));
        manifest.setSettingName(toString(data.get("settingName")));
        manifest.setConfigMapName(toString(data.get("configMapName")));
        manifest.setScanPackage(toString(data.get("scanPackage")));
        manifest.setPluginClass(toString(data.get("pluginClass")));
        Object publicPaths = data.get("publicApiPaths");
        if (publicPaths instanceof List<?> list && !list.isEmpty()) {
            manifest.setPublicApiPaths(list.stream().map(String::valueOf).toList());
        }
        Object enabled = data.get("enabled");
        manifest.setEnabled(enabled instanceof Boolean b && b);
        return manifest;
    }

    @SuppressWarnings("unchecked")
    private String parseAuthor(Object author) {
        if (author instanceof Map<?, ?> map) {
            Object name = ((Map<String, Object>) map).get("name");
            return name != null ? name.toString() : null;
        }
        return author != null ? author.toString() : null;
    }

    private String toString(Object value) {
        return value != null ? value.toString() : null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> readDescriptor(Path pluginPath) {
        try {
            if (Files.isDirectory(pluginPath)) {
                Path yaml = pluginPath.resolve(DESCRIPTOR_FILE);
                if (Files.exists(yaml)) {
                    try (InputStream in = Files.newInputStream(yaml)) {
                        return load(in);
                    }
                }
            } else {
                try (JarFile jar = new JarFile(pluginPath.toFile())) {
                    ZipEntry entry = jar.getEntry(DESCRIPTOR_FILE);
                    if (entry != null) {
                        try (InputStream in = jar.getInputStream(entry)) {
                            return load(in);
                        }
                    }
                }
            }
        } catch (Exception e) {
            throw new PluginRuntimeException("读取 plugin.yaml 失败: " + pluginPath, e);
        }
        throw new PluginRuntimeException("未找到 plugin.yaml: " + pluginPath);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> load(InputStream in) {
        Object loaded = new Yaml().load(in);
        return loaded instanceof Map<?, ?> map ? (Map<String, Object>) map : Collections.emptyMap();
    }
}
