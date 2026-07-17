package xyz.lingview.dimstack.service.impl;

import tools.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.SiteConfig;
import xyz.lingview.dimstack.domain.StorageMethod;
import xyz.lingview.dimstack.mapper.StorageMethodMapper;
import xyz.lingview.dimstack.service.SiteConfigService;
import xyz.lingview.dimstack.service.StorageFacadeService;
import xyz.lingview.dimstack.service.StorageMethodService;
import xyz.lingview.dimstack.util.RandomUtil;

import java.util.List;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2026/07/17 20:41:55
 * @Description: 存储方式管理服务实现
 * @Version: 1.0
 */
@Slf4j
@Service
public class StorageMethodServiceImpl implements StorageMethodService {

    @Autowired
    private StorageMethodMapper storageMethodMapper;

    @Autowired
    private SiteConfigService siteConfigService;

    @Autowired
    private StorageFacadeService storageFacadeService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<StorageMethod> list() {
        List<StorageMethod> list = storageMethodMapper.selectAll();
        // 密钥脱敏
        for (StorageMethod method : list) {
            if (method.getConfig() != null) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> config = objectMapper.readValue(method.getConfig(), Map.class);
                    config.put("accessKey", "");
                    config.put("secretKey", "");
                    method.setConfig(objectMapper.writeValueAsString(config));
                } catch (Exception e) {
                    method.setConfig(null);
                }
            }
        }
        return list;
    }

    @Override
    public StorageMethod getByUuid(String uuid) {
        return storageMethodMapper.selectByUuid(uuid);
    }

    @Override
    public Map<String, String> add(StorageMethod storageMethod, String userUuid) {
        String uuid = RandomUtil.generateUUID();
        storageMethod.setUuid(uuid);
        storageMethod.setUser_uuid(userUuid);
        storageMethod.setStatus(1);

        int result = storageMethodMapper.insert(storageMethod);
        if (result != 1) {
            log.error("新增存储方式失败: {}", storageMethod.getName());
            return Map.of("error", "新增存储方式失败");
        }

        log.info("新增存储方式成功: {} ({})", storageMethod.getName(), uuid);
        return Map.of("message", "新增成功", "uuid", uuid);
    }

    @Override
    public Map<String, String> edit(StorageMethod storageMethod) {
        StorageMethod existing = storageMethodMapper.selectByUuid(storageMethod.getUuid());
        if (existing == null) {
            return Map.of("error", "存储方式不存在");
        }

        // 保留原有密钥
        if (storageMethod.getConfig() != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> newConfig = objectMapper.readValue(storageMethod.getConfig(), Map.class);
                @SuppressWarnings("unchecked")
                Map<String, Object> oldConfig = objectMapper.readValue(existing.getConfig(), Map.class);

                String newAccessKey = (String) newConfig.get("accessKey");
                String newSecretKey = (String) newConfig.get("secretKey");

                if (newAccessKey == null || newAccessKey.isEmpty()) {
                    newConfig.put("accessKey", oldConfig.get("accessKey"));
                }
                if (newSecretKey == null || newSecretKey.isEmpty()) {
                    newConfig.put("secretKey", oldConfig.get("secretKey"));
                }

                storageMethod.setConfig(objectMapper.writeValueAsString(newConfig));
            } catch (Exception e) {
                log.warn("解析存储配置JSON失败，使用原配置", e);
                storageMethod.setConfig(existing.getConfig());
            }
        }

        storageMethod.setStatus(existing.getStatus());

        int result = storageMethodMapper.update(storageMethod);
        if (result != 1) {
            log.error("编辑存储方式失败: {}", storageMethod.getUuid());
            return Map.of("error", "编辑存储方式失败");
        }

        storageFacadeService.invalidateCache(storageMethod.getUuid());

        log.info("编辑存储方式成功: {}", storageMethod.getUuid());
        return Map.of("message", "编辑成功");
    }

    @Override
    public Map<String, String> disable(String uuid) {
        StorageMethod method = storageMethodMapper.selectByUuid(uuid);
        if (method == null) {
            return Map.of("error", "存储方式不存在");
        }
        if ("local".equals(method.getType())) {
            return Map.of("error", "不允许禁用本地存储");
        }
        if (method.getStatus() == 0) {
            return Map.of("error", "存储方式已禁用");
        }

        String currentDefault = siteConfigService.getSiteConfig().getDefault_storage();
        if (uuid.equals(currentDefault)) {
            return Map.of("error", "默认存储方式不可禁用，请先切换默认存储");
        }

        int result = storageMethodMapper.disable(uuid);
        if (result != 1) {
            return Map.of("error", "禁用存储方式失败");
        }

        storageFacadeService.invalidateCache(uuid);
        log.info("存储方式已禁用: {}", uuid);
        return Map.of("message", "已禁用");
    }

    @Override
    public Map<String, String> enable(String uuid) {
        StorageMethod method = storageMethodMapper.selectByUuid(uuid);
        if (method == null) {
            return Map.of("error", "存储方式不存在");
        }

        int result = storageMethodMapper.enable(uuid);
        if (result != 1) {
            return Map.of("error", "启用存储方式失败");
        }

        log.info("存储方式已启用: {}", uuid);
        return Map.of("message", "已启用");
    }

    @Override
    public Map<String, String> deletePhysical(String uuid) {
        StorageMethod method = storageMethodMapper.selectByUuid(uuid);
        if (method == null) {
            return Map.of("error", "存储方式不存在");
        }
        if ("local".equals(method.getType())) {
            return Map.of("error", "不允许删除本地存储");
        }

        String currentDefault = siteConfigService.getSiteConfig().getDefault_storage();
        if (uuid.equals(currentDefault)) {
            return Map.of("error", "默认存储方式不可删除，请先切换默认存储");
        }

        int result = storageMethodMapper.deletePhysical(uuid);
        if (result != 1) {
            return Map.of("error", "删除存储方式失败");
        }

        storageFacadeService.invalidateCache(uuid);
        log.info("存储方式已物理删除: {}", uuid);
        return Map.of("message", "已删除");
    }

    @Override
    public Map<String, String> setDefault(String uuid) {
        StorageMethod method = storageMethodMapper.selectByUuid(uuid);
        if (method == null) {
            return Map.of("error", "存储方式不存在");
        }
        if (method.getStatus() == 0) {
            return Map.of("error", "存储方式已禁用，无法设为默认");
        }

        SiteConfig siteConfig = siteConfigService.getSiteConfig();
        siteConfig.setDefault_storage(uuid);
        siteConfigService.updateSiteConfig(siteConfig);

        log.info("默认存储方式已更新为: {} ({})", method.getName(), uuid);
        return Map.of("message", "默认存储方式已更新");
    }
}