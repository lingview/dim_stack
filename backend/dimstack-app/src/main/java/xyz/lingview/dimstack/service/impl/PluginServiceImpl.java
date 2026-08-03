package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.pf4j.PluginManager;
import org.pf4j.PluginRuntimeException;
import org.pf4j.PluginState;
import org.pf4j.PluginWrapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import xyz.lingview.dimstack.domain.PluginInfo;
import xyz.lingview.dimstack.mapper.PluginMapper;
import xyz.lingview.dimstack.plugin.DimStackPluginManager;
import xyz.lingview.dimstack.plugin.PluginManifest;
import xyz.lingview.dimstack.plugin.YamlPluginDescriptorFinder;
import xyz.lingview.dimstack.service.PluginService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/08/03 20:23:41
 * @Description: 插件管理服务实现
 * @Version: 1.0
 */
@Slf4j
@Service
public class PluginServiceImpl implements PluginService {

    private final DimStackPluginManager pluginManager;
    private final PluginMapper pluginMapper;
    private final YamlPluginDescriptorFinder descriptorFinder;

    private final Path pluginDir = Path.of(System.getProperty("user.dir"), "plugins");

    public PluginServiceImpl(DimStackPluginManager pluginManager,
                             PluginMapper pluginMapper,
                             YamlPluginDescriptorFinder descriptorFinder) {
        this.pluginManager = pluginManager;
        this.pluginMapper = pluginMapper;
        this.descriptorFinder = descriptorFinder;
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
            PluginManifest manifest = parseManifest(temp);
            if (pluginMapper.selectByName(manifest.getId()) != null) {
                throw new PluginRuntimeException("插件已存在: " + manifest.getId());
            }
            String fileName = manifest.getId() + "-" + manifest.getVersion() + ".jar";
            Path dest = pluginDir.resolve(fileName);
            Files.copy(temp, dest, StandardCopyOption.REPLACE_EXISTING);

            PluginInfo info = new PluginInfo();
            info.setName(manifest.getId());
            info.setVersion(manifest.getVersion());
            info.setDisplay_name(manifest.getDisplayName());
            info.setDescription(manifest.getDescription());
            info.setAuthor(manifest.getAuthor());
            info.setRequires(manifest.getRequires());
            info.setJar_file(fileName);
            info.setEnabled(false);
            info.setSetting_name(manifest.getSettingName());
            info.setConfig_map_name(manifest.getConfigMapName());
            pluginMapper.insert(info);
            info.setState(PluginState.UNLOADED.name());
            log.info("插件安装成功: {}@{}", info.getName(), info.getVersion());
            return info;
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
        log.info("插件已卸载: {}", name);
        return true;
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

    private void validateJar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new PluginRuntimeException("上传文件为空");
        }
        String name = file.getOriginalFilename();
        if (name == null || !name.toLowerCase().endsWith(".jar")) {
            throw new PluginRuntimeException("仅支持 jar 格式的插件文件");
        }
        if (file.getSize() > 50 * 1024 * 1024) {
            throw new PluginRuntimeException("插件文件超过 50MB 限制");
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
