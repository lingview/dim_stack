package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.pf4j.PluginRuntimeException;
import org.pf4j.PluginState;
import org.pf4j.PluginWrapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.yaml.snakeyaml.Yaml;
import tools.jackson.databind.ObjectMapper;
import xyz.lingview.dimstack.domain.PluginInfo;
import xyz.lingview.dimstack.mapper.PluginConfigMapper;
import xyz.lingview.dimstack.mapper.PluginMapper;
import xyz.lingview.dimstack.plugin.DimStackPluginManager;
import xyz.lingview.dimstack.plugin.PluginAuditLogger;
import xyz.lingview.dimstack.plugin.PluginExtensionLoader;
import xyz.lingview.dimstack.plugin.PluginManifest;
import xyz.lingview.dimstack.plugin.YamlPluginDescriptorFinder;
import xyz.lingview.dimstack.service.PluginService;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URI;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 * @Author: lingview
 * @Date: 2026/08/03 20:23:41
 * @Description: 插件管理服务实现
 * @Version: 1.0
 */
@Slf4j
@Service
public class PluginServiceImpl implements PluginService {

    private static final String CONFIG_KEY = "config";
    private static final long MAX_PLUGIN_SIZE = 50L * 1024 * 1024;

    private final DimStackPluginManager pluginManager;
    private final PluginMapper pluginMapper;
    private final YamlPluginDescriptorFinder descriptorFinder;
    private final PluginExtensionLoader extensionLoader;
    private final PluginConfigMapper configMapper;
    private final PluginAuditLogger auditLogger;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Path pluginDir = Path.of(System.getProperty("user.dir"), "plugins");

    public PluginServiceImpl(DimStackPluginManager pluginManager,
                             PluginMapper pluginMapper,
                             YamlPluginDescriptorFinder descriptorFinder,
                             PluginExtensionLoader extensionLoader,
                             PluginConfigMapper configMapper,
                             PluginAuditLogger auditLogger) {
        this.pluginManager = pluginManager;
        this.pluginMapper = pluginMapper;
        this.descriptorFinder = descriptorFinder;
        this.extensionLoader = extensionLoader;
        this.configMapper = configMapper;
        this.auditLogger = auditLogger;
    }

    @Override
    public List<PluginInfo> list() {
        List<PluginInfo> infos = pluginMapper.selectAll();
        for (PluginInfo info : infos) {
            PluginWrapper wrapper = pluginManager.getPlugin(info.getName());
            if (wrapper != null) {
                info.setState(wrapper.getPluginState().name());
                if (wrapper.getPluginState() == PluginState.FAILED && wrapper.getFailedException() != null) {
                    info.setLast_error(wrapper.getFailedException().getMessage());
                }
            } else {
                info.setState(PluginState.UNLOADED.name());
            }
        }
        return infos;
    }

    @Override
    public PluginInfo install(MultipartFile file) {
        validateJar(file);
        Path temp = null;
        try {
            temp = Files.createTempFile("plugin-upload-", ".jar");
            file.transferTo(temp.toFile());
            return installJar(temp, "本地上传");
        } catch (PluginRuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new PluginRuntimeException("插件安装失败", e);
        } finally {
            if (temp != null) {
                try {
                    Files.deleteIfExists(temp);
                } catch (IOException ignored) {
                }
            }
        }
    }

    @Override
    public PluginInfo installFromUri(String url) {
        validateDownloadUrl(url);
        Path temp = null;
        try {
            temp = Files.createTempFile("plugin-uri-", ".jar");
            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setConnectTimeout(10_000);
            connection.setReadTimeout(60_000);
            connection.setInstanceFollowRedirects(true);
            try (InputStream in = connection.getInputStream();
                 java.io.OutputStream out = Files.newOutputStream(temp)) {
                in.transferTo(out);
            }
            return installJar(temp, "URL 安装: " + url);
        } catch (PluginRuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new PluginRuntimeException("插件下载或安装失败: " + e.getMessage(), e);
        } finally {
            if (temp != null) {
                try {
                    Files.deleteIfExists(temp);
                } catch (IOException ignored) {
                }
            }
        }
    }

    private PluginInfo installJar(Path jar, String source) {
        try {
            validateJarPath(jar);
            PluginManifest manifest = parseManifest(jar);
            if (pluginMapper.selectByName(manifest.getId()) != null) {
                throw new PluginRuntimeException("插件已存在: " + manifest.getId());
            }
            String fileName = manifest.getId() + "-" + manifest.getVersion() + ".jar";
            Path dest = pluginDir.resolve(fileName);
            Files.copy(jar, dest, StandardCopyOption.REPLACE_EXISTING);

            PluginInfo info = new PluginInfo();
            info.setName(manifest.getId());
            info.setVersion(manifest.getVersion());
            info.setDisplay_name(manifest.getDisplayName());
            info.setDescription(manifest.getDescription());
            info.setAuthor(manifest.getAuthor());
            info.setRequires(manifest.getRequires());
            info.setJar_file(fileName);
            info.setSha256(sha256Hex(jar));
            info.setEnabled(false);
            info.setSetting_name(manifest.getSettingName());
            info.setConfig_map_name(manifest.getConfigMapName());
            pluginMapper.insert(info);
            info.setState(PluginState.UNLOADED.name());
            auditLogger.log("install", info.getName(), info.getVersion(), true, source);
            log.info("插件安装成功: {}@{} ({})", info.getName(), info.getVersion(), source);
            return info;
        } catch (PluginRuntimeException e) {
            auditLogger.log("install", "?", null, false, e.getMessage());
            throw e;
        } catch (Exception e) {
            auditLogger.log("install", "?", null, false, e.getMessage());
            throw new PluginRuntimeException("插件安装失败: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean start(String name) {
        PluginWrapper wrapper = pluginManager.getPlugin(name);
        if (wrapper == null) {
            PluginInfo info = pluginMapper.selectByName(name);
            if (info == null || info.getJar_file() == null) {
                throw new PluginRuntimeException("插件不存在: " + name);
            }
            try {
                pluginManager.loadPlugin(pluginDir.resolve(info.getJar_file()));
            } catch (Exception e) {
                throw new PluginRuntimeException("插件加载失败: " + name, e);
            }
        }
        PluginState state = pluginManager.startPlugin(name);
        if (state == PluginState.STARTED) {
            pluginMapper.updateEnabled(name, true);

            PluginWrapper started = pluginManager.getPlugin(name);
            if (started != null) {
                extensionLoader.loadPluginExtensions(name, started);
            }
            log.info("插件已启用: {}", name);
            return true;
        }
        PluginWrapper failed = pluginManager.getPlugin(name);
        String reason = failed != null && failed.getFailedException() != null
                ? failed.getFailedException().getMessage() : "未知原因";
        throw new PluginRuntimeException("插件启动失败: " + reason);
    }

    @Override
    public boolean stop(String name) {
        PluginWrapper wrapper = pluginManager.getPlugin(name);
        if (wrapper == null) {
            throw new PluginRuntimeException("插件不存在: " + name);
        }
        if (wrapper.getPluginState() != PluginState.STARTED) {
            pluginMapper.updateEnabled(name, false);
            return true;
        }
        PluginState state = pluginManager.stopPlugin(name);
        if (state == PluginState.STOPPED) {
            pluginMapper.updateEnabled(name, false);
            log.info("插件已停用: {}", name);
            return true;
        }
        throw new PluginRuntimeException("插件停用失败: " + name);
    }

    @Override
    public boolean uninstall(String name) {

        PluginManifest manifest = pluginManager.getManifest(name);
        PluginWrapper wrapper = pluginManager.getPlugin(name);
        if (wrapper != null) {
            if (wrapper.getPluginState() == PluginState.STARTED) {
                pluginManager.stopPlugin(name);
            }
            pluginManager.unloadAndClose(name);
        }
        PluginInfo info = pluginMapper.selectByName(name);
        if (info != null && info.getJar_file() != null) {
            Path jarPath = pluginDir.resolve(info.getJar_file());
            try {
                Files.deleteIfExists(jarPath);
            } catch (IOException e) {
                // Windows/JVM下插件类加载器关闭后jar句柄可能延迟释放, 触发GC后重试
                System.gc();
                try {
                    Thread.sleep(500);
                } catch (InterruptedException ignored) {
                }
                try {
                    Files.deleteIfExists(jarPath);
                } catch (IOException e2) {
                    throw new PluginRuntimeException("插件文件删除失败(可能被占用), 请重启系统后重试: " + e2.getMessage());
                }
            }
        }
        pluginMapper.deleteByName(name);

        configMapper.deleteByPluginName(name);
        extensionLoader.cleanupPluginExtensions(name);

        cleanupManagedPaths(manifest);
        auditLogger.log("uninstall", name, info != null ? info.getVersion() : null, true, "卸载完成");
        log.info("插件已卸载: {}", name);
        return true;
    }

    private void cleanupManagedPaths(PluginManifest manifest) {
        if (manifest == null || manifest.getManagedPaths() == null) {
            return;
        }
        Path workDir = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
        for (String managedPath : manifest.getManagedPaths()) {
            try {
                if (managedPath == null || managedPath.isBlank()
                        || managedPath.startsWith("/") || managedPath.contains("..") || managedPath.contains(":")) {
                    log.warn("忽略非法的托管资源路径: {}", managedPath);
                    continue;
                }
                Path target = workDir.resolve(managedPath).normalize();
                if (!target.startsWith(workDir) || !Files.exists(target)) {
                    continue;
                }
                deleteRecursively(target);
                log.info("已清理插件托管资源: {}", target);
            } catch (Exception e) {
                log.warn("清理插件托管资源失败: {}", managedPath, e);
            }
        }
    }

    private void deleteRecursively(Path path) throws IOException {
        if (Files.isDirectory(path)) {
            try (var entries = Files.list(path)) {
                for (Path entry : entries.toList()) {
                    deleteRecursively(entry);
                }
            }
        }
        Files.deleteIfExists(path);
    }

    @Override
    public PluginInfo upgrade(String name, MultipartFile file) {
        validateJar(file);
        PluginInfo info = pluginMapper.selectByName(name);
        if (info == null) {
            throw new PluginRuntimeException("插件不存在: " + name);
        }
        Path temp = null;
        try {
            temp = Files.createTempFile("plugin-upgrade-", ".jar");
            file.transferTo(temp.toFile());
            PluginManifest manifest = parseManifest(temp);
            if (!name.equals(manifest.getId())) {
                throw new PluginRuntimeException("上传插件的 ID 与目标不一致");
            }

            PluginWrapper wrapper = pluginManager.getPlugin(name);
            if (wrapper != null) {
                if (wrapper.getPluginState() == PluginState.STARTED) {
                    pluginManager.stopPlugin(name);
                }
                pluginManager.unloadAndClose(name);
            }

            String newFileName = manifest.getId() + "-" + manifest.getVersion() + ".jar";
            if (info.getJar_file() != null && !info.getJar_file().equals(newFileName)) {
                Files.deleteIfExists(pluginDir.resolve(info.getJar_file()));
            }
            Path dest = pluginDir.resolve(newFileName);
            Files.copy(temp, dest, StandardCopyOption.REPLACE_EXISTING);

            info.setVersion(manifest.getVersion());
            info.setJar_file(newFileName);
            info.setSha256(sha256Hex(temp));
            info.setDisplay_name(manifest.getDisplayName());
            info.setDescription(manifest.getDescription());
            info.setAuthor(manifest.getAuthor());
            info.setRequires(manifest.getRequires());
            info.setSetting_name(manifest.getSettingName());
            info.setConfig_map_name(manifest.getConfigMapName());
            pluginMapper.updateInfo(info);

            pluginManager.loadPlugin(dest);
            if (Boolean.TRUE.equals(info.getEnabled())) {
                pluginManager.startPlugin(name);
            }
            auditLogger.log("upgrade", name, manifest.getVersion(), true, "升级成功");
            log.info("插件升级成功: {}@{}", name, manifest.getVersion());
            return info;
        } catch (PluginRuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new PluginRuntimeException("插件升级失败", e);
        } finally {
            if (temp != null) {
                try {
                    Files.deleteIfExists(temp);
                } catch (IOException ignored) {
                }
            }
        }
    }

    @Override
    public boolean reload(String name) {
        PluginInfo info = pluginMapper.selectByName(name);
        if (info == null || info.getJar_file() == null) {
            throw new PluginRuntimeException("插件不存在: " + name);
        }
        try {
            PluginWrapper wrapper = pluginManager.getPlugin(name);
            if (wrapper != null) {
                if (wrapper.getPluginState() == PluginState.STARTED) {
                    pluginManager.stopPlugin(name);
                }
                pluginManager.unloadAndClose(name);
            }
            pluginManager.loadPlugin(pluginDir.resolve(info.getJar_file()));
            if (Boolean.TRUE.equals(info.getEnabled())) {
                pluginManager.startPlugin(name);
            }
            return true;
        } catch (Exception e) {
            throw new PluginRuntimeException("插件重载失败: " + name, e);
        }
    }

    @Override
    public void syncLoadedPlugins() {
        List<PluginWrapper> wrappers = pluginManager.getPlugins();
        int synced = 0;
        for (PluginWrapper wrapper : wrappers) {
            String name = wrapper.getPluginId();
            if (pluginMapper.selectByName(name) == null) {
                PluginManifest manifest = pluginManager.getManifest(name);
                PluginInfo info = new PluginInfo();
                info.setName(name);
                info.setVersion(wrapper.getDescriptor().getVersion());
                info.setDisplay_name(manifest != null ? manifest.getDisplayName() : name);
                info.setDescription(manifest != null ? manifest.getDescription() : null);
                info.setAuthor(manifest != null ? manifest.getAuthor() : null);
                info.setRequires(wrapper.getDescriptor().getRequires());
                info.setJar_file(wrapper.getPluginPath() != null ? wrapper.getPluginPath().getFileName().toString() : name + ".jar");
                info.setEnabled(wrapper.getPluginState() == PluginState.STARTED);
                info.setSetting_name(manifest != null ? manifest.getSettingName() : null);
                info.setConfig_map_name(manifest != null ? manifest.getConfigMapName() : null);
                try {
                    pluginMapper.insert(info);
                    synced++;
                } catch (Exception e) {
                    log.warn("同步插件记录失败: {}", name, e);
                }
            }

            if (wrapper.getPluginState() == PluginState.STARTED) {
                extensionLoader.loadPluginExtensions(name, wrapper);
            }
        }
        if (synced > 0) {
            log.info("插件启动同步完成: 补录 {} 个插件", synced);
        }
    }

    @Override
    public void restoreDisabledStates() {
        List<PluginInfo> infos = pluginMapper.selectAll();
        for (PluginInfo info : infos) {
            if (!Boolean.FALSE.equals(info.getEnabled())) {
                continue;
            }
            PluginWrapper wrapper = pluginManager.getPlugin(info.getName());
            if (wrapper != null && wrapper.getPluginState() == PluginState.STARTED) {
                pluginManager.stopPlugin(info.getName());
                log.info("已按数据库状态恢复插件为停用: {}", info.getName());
            }
        }
    }

    @Override
    public Map<String, Object> getConfig(String name) {
        Map<String, Object> config = new HashMap<>();

        PluginWrapper wrapper = pluginManager.getPlugin(name);
        if (wrapper != null) {
            try (InputStream in = wrapper.getPluginClassLoader().getResourceAsStream("config.yaml")) {
                if (in != null) {
                    Object loaded = new Yaml().load(in);
                    if (loaded instanceof Map<?, ?> map) {
                        flatten("", (Map<String, Object>) map, config);
                    }
                }
            } catch (Exception e) {
                log.warn("读取插件默认配置失败: {}", name, e);
            }
        }

        String json = configMapper.selectValue(name, CONFIG_KEY);
        if (json != null && !json.isBlank()) {
            try {
                Map<String, Object> userConfig = objectMapper.readValue(json, Map.class);
                config.putAll(userConfig);
            } catch (Exception e) {
                log.warn("读取插件用户配置失败: {}", name, e);
            }
        }
        return config;
    }

    @Override
    public boolean saveConfig(String name, Map<String, Object> config) {
        if (config == null) {
            throw new PluginRuntimeException("配置内容为空");
        }
        try {
            String json = objectMapper.writeValueAsString(config);
            return configMapper.upsert(name, CONFIG_KEY, json) > 0;
        } catch (Exception e) {
            throw new PluginRuntimeException("插件配置保存失败: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private void flatten(String prefix, Map<String, Object> source, Map<String, Object> target) {
        source.forEach((key, value) -> {
            String fullKey = prefix.isEmpty() ? key : prefix + "." + key;
            if (value instanceof Map<?, ?> nested) {
                flatten(fullKey, (Map<String, Object>) nested, target);
            } else {
                target.put(fullKey, value);
            }
        });
    }

    private void validateJar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new PluginRuntimeException("上传文件为空");
        }
        String name = file.getOriginalFilename();
        if (name == null || !name.toLowerCase().endsWith(".jar")) {
            throw new PluginRuntimeException("仅支持 jar 格式的插件文件");
        }
        if (file.getSize() > MAX_PLUGIN_SIZE) {
            throw new PluginRuntimeException("插件文件超过 50MB 限制");
        }
    }

    private void validateJarPath(Path path) {
        try {
            if (!Files.exists(path) || Files.size(path) == 0) {
                throw new PluginRuntimeException("插件文件为空");
            }
            if (Files.size(path) > MAX_PLUGIN_SIZE) {
                throw new PluginRuntimeException("插件文件超过 50MB 限制");
            }
            try (InputStream in = Files.newInputStream(path)) {
                byte[] magic = in.readNBytes(4);
                if (magic.length != 4 || magic[0] != 0x50 || magic[1] != 0x4B
                        || magic[2] != 0x03 || magic[3] != 0x04) {
                    throw new PluginRuntimeException("文件不是有效的 jar(zip) 格式");
                }
            }
            try (ZipFile zip = new ZipFile(path.toFile())) {
                Enumeration<? extends ZipEntry> entries = zip.entries();
                while (entries.hasMoreElements()) {
                    String entryName = entries.nextElement().getName();
                    if (entryName.contains("..") || entryName.startsWith("/") || entryName.contains("\\")) {
                        throw new PluginRuntimeException("插件包内含非法路径条目: " + entryName);
                    }
                }
            }
        } catch (PluginRuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new PluginRuntimeException("插件文件校验失败: " + e.getMessage(), e);
        }
    }

    private String sha256Hex(Path path) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (InputStream in = Files.newInputStream(path)) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = in.read(buffer)) > 0) {
                    digest.update(buffer, 0, read);
                }
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (Exception e) {
            throw new PluginRuntimeException("插件完整性校验失败: " + e.getMessage(), e);
        }
    }

    private void validateDownloadUrl(String url) {
        try {
            URI uri = new URI(url);
            String scheme = uri.getScheme();
            if (scheme == null || (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme))) {
                throw new PluginRuntimeException("仅支持 http/https 的下载地址");
            }
            String host = uri.getHost();
            if (host == null || host.isBlank()) {
                throw new PluginRuntimeException("下载地址无效");
            }
            InetAddress address = InetAddress.getByName(host);
            if (address.isLoopbackAddress() || address.isAnyLocalAddress() || address.isSiteLocalAddress()) {
                throw new PluginRuntimeException("禁止安装来自内网/本机地址的插件");
            }
        } catch (PluginRuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new PluginRuntimeException("下载地址解析失败: " + e.getMessage(), e);
        }
    }

    private PluginManifest parseManifest(Path pluginPath) {
        try {
            return descriptorFinder.getManifest(
                    descriptorFinder.find(pluginPath).getPluginId());
        } catch (Exception e) {
            throw new PluginRuntimeException("插件描述文件(plugin.yaml)解析失败: " + e.getMessage(), e);
        }
    }
}
