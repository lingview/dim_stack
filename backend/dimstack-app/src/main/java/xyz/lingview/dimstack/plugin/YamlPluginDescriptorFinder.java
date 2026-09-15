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
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.jar.JarFile;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;

/**
 * @Author: lingview
 * @Date: 2026/07/31 22:47:09
 * @Description: 插件描述文件解析
 * @Version: 1.0
 */
public class YamlPluginDescriptorFinder implements PluginDescriptorFinder {

    private static final String DESCRIPTOR_FILE = "plugin.yaml";

    private static final Pattern PLUGIN_ID_PATTERN = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._-]{0,63}");

    private static final Pattern PLUGIN_VERSION_PATTERN = Pattern.compile("[A-Za-z0-9._+-]{1,32}");

    private static final Pattern PUBLIC_PATH_SEGMENT_PATTERN = Pattern.compile("[A-Za-z0-9._~-]+");

    private static final Set<String> RESERVED_PUBLIC_PATHS = Set.of("/config", "/start", "/stop", "/upgrade", "/reload");

    private static final int PUBLIC_PATH_MAX_LENGTH = 128;

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
        if (!PLUGIN_ID_PATTERN.matcher(manifest.getId()).matches()) {
            throw new PluginRuntimeException(
                    "plugin.yaml 的 id 含非法字符(仅允许字母/数字/._-, 且以字母或数字开头): " + manifest.getId());
        }
        if (!PLUGIN_VERSION_PATTERN.matcher(manifest.getVersion()).matches()) {
            throw new PluginRuntimeException(
                    "plugin.yaml 的 version 含非法字符(仅允许字母/数字/._+-): " + manifest.getVersion());
        }

        // pf4j3.15构造器参数顺序: (pluginId, description, pluginClass, version, requires, provider, license)
        // pf4j3.15的isPluginValid()直接对getRequires()调trim(), 缺省该字段会让NPE冒到宿主启动流程, 故补空串

        DefaultPluginDescriptor descriptor = new DefaultPluginDescriptor(
                manifest.getId(),
                manifest.getDescription(),
                manifest.getPluginClass(),
                manifest.getVersion(),
                manifest.getRequires() == null ? "" : manifest.getRequires(),
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

    private void validatePublicApiPaths(String pluginId, List<String> paths) {
        for (String path : paths) {
            if (path == null || !path.startsWith("/") || path.length() > PUBLIC_PATH_MAX_LENGTH) {
                throw new PluginRuntimeException(
                        "插件 " + pluginId + " 的 publicApiPaths 非法(必须以 / 开头且不超过 " + PUBLIC_PATH_MAX_LENGTH + " 字符): " + path);
            }
            for (String segment : path.substring(1).split("/", -1)) {
                if (segment.isEmpty()) {
                    throw new PluginRuntimeException(
                            "插件 " + pluginId + " 的 publicApiPaths 不得包含空路径段(// 或尾随 /): " + path);
                }
                if (segment.equals(".") || segment.equals("..")) {
                    throw new PluginRuntimeException(
                            "插件 " + pluginId + " 的 publicApiPaths 不得包含 . 或 .. 路径段: " + path);
                }
                if (!PUBLIC_PATH_SEGMENT_PATTERN.matcher(segment).matches()) {
                    throw new PluginRuntimeException(
                            "插件 " + pluginId + " 的 publicApiPaths 仅允许字母/数字/._~- 且不支持占位符或通配符: " + path);
                }
            }
            if (RESERVED_PUBLIC_PATHS.contains(path)) {
                throw new PluginRuntimeException(
                        "插件 " + pluginId + " 的 publicApiPaths 不得使用宿主保留路径(见 PluginController): " + path);
            }
        }
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
            List<String> paths = list.stream().map(String::valueOf).toList();
            validatePublicApiPaths(manifest.getId(), paths);
            manifest.setPublicApiPaths(paths);
        }
        Object managedPaths = data.get("managedPaths");
        if (managedPaths instanceof List<?> list && !list.isEmpty()) {
            manifest.setManagedPaths(list.stream().map(String::valueOf).toList());
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
