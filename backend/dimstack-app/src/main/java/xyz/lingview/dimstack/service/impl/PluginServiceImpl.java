package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.pf4j.PluginRuntimeException;
import org.pf4j.PluginState;
import org.pf4j.PluginWrapper;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;
import xyz.lingview.dimstack.domain.PluginInfo;
import xyz.lingview.dimstack.domain.PluginSqlAudit;
import xyz.lingview.dimstack.mapper.PluginConfigMapper;
import xyz.lingview.dimstack.mapper.PluginMapper;
import xyz.lingview.dimstack.mapper.PluginSqlAuditMapper;
import xyz.lingview.dimstack.plugin.DimStackPluginManager;
import xyz.lingview.dimstack.plugin.PluginAuditLogger;
import xyz.lingview.dimstack.plugin.PluginExtensionLoader;
import xyz.lingview.dimstack.plugin.PluginLifecycleGuard;
import xyz.lingview.dimstack.plugin.PluginManifest;
import xyz.lingview.dimstack.plugin.PluginPermissionRegistrar;
import xyz.lingview.dimstack.plugin.PluginYamlLoader;
import xyz.lingview.dimstack.plugin.YamlPluginDescriptorFinder;
import xyz.lingview.dimstack.service.PluginService;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;
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
    private final PluginSqlAuditMapper sqlAuditMapper;
    private final PluginPermissionRegistrar permissionRegistrar;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Path pluginDir = Path.of(System.getProperty("user.dir"), "plugins");

    private final ConcurrentHashMap<String, ReentrantLock> pluginLocks = new ConcurrentHashMap<>();

    private final PluginLifecycleGuard lifecycleGuard;

    public PluginServiceImpl(DimStackPluginManager pluginManager,
                             PluginMapper pluginMapper,
                             YamlPluginDescriptorFinder descriptorFinder,
                             PluginExtensionLoader extensionLoader,
                             PluginConfigMapper configMapper,
                             PluginAuditLogger auditLogger,
                             PluginSqlAuditMapper sqlAuditMapper,
                             PluginPermissionRegistrar permissionRegistrar,
                             PluginLifecycleGuard lifecycleGuard) {
        this.pluginManager = pluginManager;
        this.pluginMapper = pluginMapper;
        this.descriptorFinder = descriptorFinder;
        this.extensionLoader = extensionLoader;
        this.configMapper = configMapper;
        this.auditLogger = auditLogger;
        this.sqlAuditMapper = sqlAuditMapper;
        this.permissionRegistrar = permissionRegistrar;
        this.lifecycleGuard = lifecycleGuard;
    }

    private Path resolvePluginJar(String fileName) {
        Path dest = pluginDir.resolve(fileName).normalize();
        if (!dest.startsWith(pluginDir.normalize())) {
            throw new PluginRuntimeException("插件文件名越出插件目录: " + fileName);
        }
        return dest;
    }

    private <T> T withLock(String key, Supplier<T> action) {
        ReentrantLock lock = pluginLocks.computeIfAbsent(key, k -> new ReentrantLock());
        lock.lock();
        try {
            return action.get();
        } finally {
            lock.unlock();
        }
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
        return lifecycleGuard.withWriteLock(() -> doInstall(file));
    }

    private PluginInfo doInstall(MultipartFile file) {
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


    private PluginInfo installJar(Path jar, String source) {
        try {
            validateJarPath(jar);
            PluginManifest manifest = parseManifest(jar);
            if (pluginMapper.selectByName(manifest.getId()) != null) {
                throw new PluginRuntimeException("插件已存在: " + manifest.getId());
            }
            String fileName = manifest.getId() + "-" + manifest.getVersion() + ".jar";
            Path dest = resolvePluginJar(fileName);
            if (Files.exists(dest)) {
                throw new PluginRuntimeException("同名插件文件已存在(可能是上次卸载残留): " + fileName + ", 请先清理 " + pluginDir + " 后重试");
            }
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
            try {
                pluginMapper.insert(info);
            } catch (DuplicateKeyException e) {
                log.warn("插件记录已存在, 回滚刚落盘的 jar: {}", fileName);
                Files.deleteIfExists(dest);
                throw new PluginRuntimeException("插件已存在: " + manifest.getId());
            }
            info.setState(PluginState.UNLOADED.name());
            auditLogger.log("install", info.getName(), info.getVersion(), true, source);
            log.info("插件安装成功: {}@{} ({})", info.getName(), info.getVersion(), source);
            return info;
        } catch (PluginRuntimeException e) {
            auditLogger.log("install", "?", null, false, e.getMessage());
            throw e;
        } catch (Exception e) {
            auditLogger.log("install", "?", null, false, e.getMessage());
            log.error("插件安装发生非业务异常", e);
            throw new PluginRuntimeException("插件安装失败, 请查看服务端日志");
        }
    }

    @Override
    public boolean start(String name) {
        return lifecycleGuard.withWriteLock(() -> doStart(name));
    }

    private boolean doStart(String name) {
        PluginWrapper wrapper = pluginManager.getPlugin(name);
        if (wrapper == null) {
            PluginInfo info = pluginMapper.selectByName(name);
            if (info == null || info.getJar_file() == null) {
                throw new PluginRuntimeException("插件不存在: " + name);
            }
            try {
                pluginManager.loadPlugin(resolvePluginJar(info.getJar_file()));
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
        return lifecycleGuard.withWriteLock(() -> doStop(name));
    }

    private boolean doStop(String name) {
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
        return lifecycleGuard.withWriteLock(() -> doUninstall(name));
    }

    private boolean doUninstall(String name) {

        PluginManifest manifest = pluginManager.getManifest(name);
        PluginWrapper wrapper = pluginManager.getPlugin(name);
        if (wrapper != null) {
            if (wrapper.getPluginState() == PluginState.STARTED) {
                pluginManager.stopPlugin(name);
            }
            pluginManager.unloadAndClose(name);
        }

        PluginInfo info = pluginMapper.selectByName(name);
        pluginMapper.deleteByName(name);

        configMapper.deleteByPluginName(name);
        extensionLoader.cleanupPluginExtensions(name);
        permissionRegistrar.unregisterOnUninstall(name);

        String managedNote = cleanupManagedPaths(manifest);
        String fileNote = deletePluginJar(info);
        auditLogger.log("uninstall", name, info != null ? info.getVersion() : null, true, "卸载完成" + managedNote + fileNote);
        log.info("插件已卸载: {}{}{}", name, managedNote, fileNote);
        return true;
    }

    private String deletePluginJar(PluginInfo info) {
        if (info == null || info.getJar_file() == null) {
            return "";
        }
        Path jarPath = resolvePluginJar(info.getJar_file());
        try {
            Files.deleteIfExists(jarPath);
            return "";
        } catch (IOException e) {
            // Windows/JVM下插件类加载器关闭后jar句柄可能延迟释放, 触发GC后重试
            System.gc();
            try {
                Thread.sleep(500);
            } catch (InterruptedException ignored) {
            }
            try {
                Files.deleteIfExists(jarPath);
                return "";
            } catch (IOException e2) {
                log.warn("插件文件删除失败, 待重启后清理: {} ({})", jarPath, e2.getMessage());
                return "(jar 文件被占用, 待重启后清理: " + info.getJar_file() + ")";
            }
        }
    }

    public static final String MANAGED_MARKER_FILE = ".managed-by";

    private String cleanupManagedPaths(PluginManifest manifest) {
        if (manifest == null || manifest.getManagedPaths() == null) {
            return "";
        }
        Path workDir = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
        List<String> failures = new ArrayList<>();
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

                Path ownerMarker = target.resolve(MANAGED_MARKER_FILE);
                if (!Files.isRegularFile(ownerMarker)) {
                    log.warn("托管资源缺少署名标记 {}, 跳过清理: {}", MANAGED_MARKER_FILE, target);
                    failures.add(managedPath + "(缺少署名标记)");
                    continue;
                }
                String owner = Files.readString(ownerMarker, StandardCharsets.UTF_8).trim();
                if (!manifest.getId().equals(owner)) {
                    log.warn("托管资源署名不匹配(声明者={}, 标记={}), 跳过清理: {}", manifest.getId(), owner, target);
                    failures.add(managedPath + "(署名不匹配)");
                    continue;
                }
                deleteRecursively(target);
                log.info("已清理插件托管资源: {}", target);
            } catch (Exception e) {
                log.warn("清理插件托管资源失败: {}", managedPath, e);
                failures.add(managedPath);
            }
        }
        return failures.isEmpty() ? "" : "(托管资源未完全清理: " + String.join(", ", failures) + ")";
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
        return lifecycleGuard.withWriteLock(() -> doUpgrade(name, file));
    }

    private PluginInfo doUpgrade(String name, MultipartFile file) {
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
            if (manifest.getVersion().equals(info.getVersion())) {
                throw new PluginRuntimeException("上传版本与当前版本相同(" + manifest.getVersion() + "), 请修改版本号后再升级");
            }

            String oldJarFile = info.getJar_file();
            boolean wasEnabled = Boolean.TRUE.equals(info.getEnabled());
            String newFileName = manifest.getId() + "-" + manifest.getVersion() + ".jar";
            Path dest = resolvePluginJar(newFileName);

            try {
                PluginWrapper wrapper = pluginManager.getPlugin(name);
                if (wrapper != null) {
                    if (wrapper.getPluginState() == PluginState.STARTED) {
                        pluginManager.stopPlugin(name);
                    }
                    pluginManager.unloadAndClose(name);
                }

                Files.copy(temp, dest, StandardCopyOption.REPLACE_EXISTING);

                String loadedId = pluginManager.loadPlugin(dest);
                if (loadedId == null) {
                    throw new PluginRuntimeException("新版本加载失败: " + name);
                }
                if (wasEnabled) {
                    PluginState startState = pluginManager.startPlugin(name);
                    if (startState != PluginState.STARTED) {
                        throw new PluginRuntimeException("新版本启动失败: " + name);
                    }
                }
            } catch (Exception e) {
                auditLogger.log("upgrade", name, manifest.getVersion(), false, "升级失败, 已回滚: " + e.getMessage());
                throw rollbackUpgrade(name, dest, oldJarFile, wasEnabled, e);
            }

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

            if (oldJarFile != null && !oldJarFile.equals(newFileName) && !deleteWithRetry(resolvePluginJar(oldJarFile))) {
                log.warn("旧版本插件jar删除失败, 请重启后手动清理: {}", oldJarFile);
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

    private PluginRuntimeException rollbackUpgrade(String name, Path newJar, String oldJarFile, boolean wasEnabled, Exception cause) {
        log.warn("插件升级失败, 开始回滚: {} ({})", name, cause.getMessage());
        try {
            pluginManager.unloadAndClose(name);
        } catch (Exception e) {
            log.warn("回滚时卸载新版本失败: {} ({})", name, e.getMessage());
        }
        if (!deleteWithRetry(newJar)) {
            log.warn("回滚时新版本jar删除失败, 请重启后手动清理: {}", newJar.getFileName());
        }
        if (oldJarFile != null) {
            Path oldJar = resolvePluginJar(oldJarFile);
            if (Files.exists(oldJar)) {
                try {
                    pluginManager.loadPlugin(oldJar);
                    if (wasEnabled) {
                        pluginManager.startPlugin(name);
                    }
                } catch (Exception e) {
                    log.error("回滚后旧版本重新加载失败: {} ({})", name, e.getMessage());
                }
            }
        }
        return new PluginRuntimeException("插件升级失败, 已回滚到旧版本: " + name + " (" + cause.getMessage() + ")", cause);
    }

    private boolean deleteWithRetry(Path path) {
        try {
            Files.deleteIfExists(path);
            return true;
        } catch (IOException e) {
            System.gc();
            try {
                Thread.sleep(500);
            } catch (InterruptedException ignored) {
            }
            try {
                Files.deleteIfExists(path);
                return true;
            } catch (IOException e2) {
                log.warn("文件删除失败: {} ({})", path, e2.getMessage());
                return false;
            }
        }
    }

    @Override
    public boolean reload(String name) {
        return lifecycleGuard.withWriteLock(() -> doReload(name));
    }

    private boolean doReload(String name) {
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
            String loadedId = pluginManager.loadPlugin(resolvePluginJar(info.getJar_file()));
            if (loadedId == null) {
                throw new PluginRuntimeException("插件加载失败: " + name);
            }
            if (Boolean.TRUE.equals(info.getEnabled())) {
                PluginState startState = pluginManager.startPlugin(name);
                if (startState != PluginState.STARTED) {
                    pluginMapper.updateEnabled(name, false);
                    throw new PluginRuntimeException("插件启动失败, 已回写为停用状态: " + name);
                }
            }
            return true;
        } catch (Exception e) {
            throw new PluginRuntimeException("插件重载失败: " + name, e);
        }
    }

    @Override
    public void syncLoadedPlugins() {
        lifecycleGuard.withWriteLock(() -> {
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
                    // 手动放置的jar统一补录为待启用, 避免绕过安装校验直接对外服务
                    info.setEnabled(false);
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
        });
    }

    @Override
    public void startEnabledPlugins() {
        lifecycleGuard.withWriteLock(() -> {
            for (PluginInfo info : pluginMapper.selectAll()) {
                if (!Boolean.TRUE.equals(info.getEnabled())) {
                    continue;
                }
                try {
                    start(info.getName());
                } catch (Exception e) {
                    log.error("插件启动失败, 已跳过(不影响宿主): {} ({})", info.getName(), e.getMessage());
                }
            }
        });
    }

    @Override
    public Map<String, Object> getConfig(String name) {
        Map<String, Object> config = new HashMap<>();

        PluginWrapper wrapper = pluginManager.getPlugin(name);
        if (wrapper != null) {
            try (InputStream in = wrapper.getPluginClassLoader().getResourceAsStream("config.yaml")) {
                if (in != null) {
                    Map<String, Object> loaded = PluginYamlLoader.load(in);
                    if (!loaded.isEmpty()) {
                        flatten("", loaded, config);
                    }
                }
            } catch (Exception e) {
                log.warn("读取插件默认配置失败: {}", name, e);
            }
        }

        String json = configMapper.selectValue(name, configKey(pluginMapper.selectByName(name)));
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
        return withLock(name, () -> {
            PluginInfo info = pluginMapper.selectByName(name);
            if (info == null) {
                throw new PluginRuntimeException("插件不存在: " + name);
            }
            try {
                String json = objectMapper.writeValueAsString(config);
                return configMapper.upsert(name, configKey(info), json) > 0;
            } catch (PluginRuntimeException e) {
                throw e;
            } catch (Exception e) {
                log.error("插件配置保存失败: {}", name, e);
                throw new PluginRuntimeException("插件配置保存失败, 请查看服务端日志");
            }
        });
    }

    private String configKey(PluginInfo info) {
        String configKey = info != null ? info.getConfig_map_name() : null;
        return configKey != null && !configKey.isBlank() ? configKey : CONFIG_KEY;
    }

    @Override
    public List<PluginSqlAudit> listSqlAudit(String name, int page, int size) {
        return sqlAuditMapper.selectPage(name, (page - 1) * size, size);
    }

    @Override
    public long countSqlAudit(String name) {
        return sqlAuditMapper.countByPlugin(name);
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

    private PluginManifest parseManifest(Path pluginPath) {
        try {
            return descriptorFinder.getManifest(
                    descriptorFinder.find(pluginPath).getPluginId());
        } catch (Exception e) {
            throw new PluginRuntimeException("插件描述文件(plugin.yaml)解析失败: " + e.getMessage(), e);
        }
    }
}
