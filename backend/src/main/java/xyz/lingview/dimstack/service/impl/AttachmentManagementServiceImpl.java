package xyz.lingview.dimstack.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.AttachmentManagement;
import xyz.lingview.dimstack.mapper.AttachmentManagementMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.AttachmentManagementService;

import java.io.File;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2026/02/08 17:35:00
 * @Description: 附件管理服务实现类
 * @Version: 1.0
 */
@Service
@Slf4j
public class AttachmentManagementServiceImpl implements AttachmentManagementService {
    
    @Autowired
    private AttachmentManagementMapper attachmentManagementMapper;
    
    @Autowired
    private UserInformationMapper userInformationMapper;
    
    @Value("${file.data-root:.}")
    private String dataRoot;
    
    @Override
    public Map<String, Object> getPage(int page, int size) {
        int offset = (page - 1) * size;
        List<AttachmentManagement> attachments = attachmentManagementMapper.selectPage(offset, size);
        int total = attachmentManagementMapper.countAll();

        for (AttachmentManagement attachment : attachments) {
            String username = userInformationMapper.getUsernameByUuid(attachment.getUuid());
            attachment.setUsername(username != null ? username : "未知用户");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", attachments);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        
        return result;
    }
    
    @Override
    public Map<String, Object> getPageByUuid(String uuid, int page, int size) {
        int offset = (page - 1) * size;
        List<AttachmentManagement> attachments = attachmentManagementMapper.selectPageByUuid(uuid, offset, size);
        int total = attachmentManagementMapper.countByUuid(uuid);

        for (AttachmentManagement attachment : attachments) {
            String username = userInformationMapper.getUsernameByUuid(attachment.getUuid());
            attachment.setUsername(username != null ? username : "未知用户");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", attachments);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        
        return result;
    }
    
    @Override
    public Map<String, Object> getPageWithRecentDeleted(int page, int size) {
        int offset = (page - 1) * size;
        List<AttachmentManagement> attachments = attachmentManagementMapper.selectAllPageWithRecentDeleted(offset, size);
        int total = attachmentManagementMapper.countAllWithRecentDeleted();

        for (AttachmentManagement attachment : attachments) {
            String username = userInformationMapper.getUsernameByUuid(attachment.getUuid());
            attachment.setUsername(username != null ? username : "未知用户");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", attachments);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        
        return result;
    }
    
    @Override
    public Map<String, Object> getDeletedPageOnly(int page, int size) {
        int offset = (page - 1) * size;
        List<AttachmentManagement> attachments = attachmentManagementMapper.selectDeletedOnlyPage(offset, size);
        int total = attachmentManagementMapper.countDeletedOnly();

        for (AttachmentManagement attachment : attachments) {
            String username = userInformationMapper.getUsernameByUuid(attachment.getUuid());
            attachment.setUsername(username != null ? username : "未知用户");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", attachments);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        
        return result;
    }
    
    @Override
    public Map<String, Object> getPageByUuidWithRecentDeleted(String uuid, int page, int size) {
        int offset = (page - 1) * size;
        List<AttachmentManagement> attachments = attachmentManagementMapper.selectPageByUuidWithRecentDeleted(uuid, offset, size);
        int total = attachmentManagementMapper.countByUuidWithRecentDeleted(uuid);

        for (AttachmentManagement attachment : attachments) {
            String username = userInformationMapper.getUsernameByUuid(attachment.getUuid());
            attachment.setUsername(username != null ? username : "未知用户");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", attachments);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        
        return result;
    }
    
    @Override
    public Map<String, Object> getDeletedPageByUuidOnly(String uuid, int page, int size) {
        int offset = (page - 1) * size;
        List<AttachmentManagement> attachments = attachmentManagementMapper.selectDeletedOnlyPageByUuid(uuid, offset, size);
        int total = attachmentManagementMapper.countDeletedOnlyByUuid(uuid);

        for (AttachmentManagement attachment : attachments) {
            String username = userInformationMapper.getUsernameByUuid(attachment.getUuid());
            attachment.setUsername(username != null ? username : "未知用户");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", attachments);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        
        return result;
    }
    
    @Override
    public Map<String, Object> getPageByUserUuid(String userUuid, int page, int size) {
        int offset = (page - 1) * size;
        List<AttachmentManagement> attachments = attachmentManagementMapper.selectPageByUserUuid(userUuid, offset, size);
        int total = attachmentManagementMapper.countByUserUuid(userUuid);

        for (AttachmentManagement attachment : attachments) {
            String username = userInformationMapper.getUsernameByUuid(attachment.getUuid());
            attachment.setUsername(username != null ? username : "未知用户");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", attachments);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        
        return result;
    }
    
    @Override
    public Map<String, Object> getPageByUserUuidWithDeleted(String userUuid, int page, int size) {
        int offset = (page - 1) * size;
        List<AttachmentManagement> attachments = attachmentManagementMapper.selectPageByUserUuidWithDeleted(userUuid, offset, size);
        int total = attachmentManagementMapper.countByUserUuidWithDeleted(userUuid);

        for (AttachmentManagement attachment : attachments) {
            String username = userInformationMapper.getUsernameByUuid(attachment.getUuid());
            attachment.setUsername(username != null ? username : "未知用户");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", attachments);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        
        return result;
    }
    
    @Override
    public Map<String, Object> getDeletedPageByUserUuidOnly(String userUuid, int page, int size) {
        int offset = (page - 1) * size;
        List<AttachmentManagement> attachments = attachmentManagementMapper.selectDeletedOnlyPageByUserUuid(userUuid, offset, size);
        int total = attachmentManagementMapper.countDeletedOnlyByUserUuid(userUuid);

        for (AttachmentManagement attachment : attachments) {
            String username = userInformationMapper.getUsernameByUuid(attachment.getUuid());
            attachment.setUsername(username != null ? username : "未知用户");
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", attachments);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        
        return result;
    }
    
    @Override
    public boolean deleteAttachment(String attachmentId) {
        LocalDateTime deletedTime = LocalDateTime.now();
        int result = attachmentManagementMapper.deleteByAttachmentId(attachmentId, deletedTime);
        return result > 0;
    }
    
    @Override
    public boolean restoreAttachment(String attachmentId) {
        int result = attachmentManagementMapper.restoreAttachment(attachmentId);
        return result > 0;
    }
    
    @Override
    public String getAttachmentOwnerUuid(String attachmentId) {
        AttachmentManagement attachment = attachmentManagementMapper.selectByAttachmentId(attachmentId);
        return attachment != null ? attachment.getUuid() : null;
    }
    
    @Override
    public int cleanupExpiredDeletedAttachments() {
        List<AttachmentManagement> expiredAttachments = attachmentManagementMapper.selectExpiredDeletedAttachments();
        
        int cleanedCount = 0;
        
        for (AttachmentManagement attachment : expiredAttachments) {
            try {
                String filePath = attachment.getAttachment_path();
                log.debug("准备清理过期附件: {}", filePath);
                
                boolean fileDeleted = deletePhysicalFile(filePath);
                
                if (fileDeleted) {
                    int result = attachmentManagementMapper.physicallyDeleteAttachment(attachment.getAttachment_id());
                    if (result > 0) {
                        cleanedCount++;
                        log.info("成功清理过期附件: {}", attachment.getAttachment_id());
                    }
                }
            } catch (Exception e) {
                log.error("清理附件失败: {}, 错误: {}", attachment.getAttachment_id(), e.getMessage(), e);
            }
        }
        
        log.info("附件清理任务完成，共清理 {} 个附件", cleanedCount);
        return cleanedCount;
    }

    private boolean deletePhysicalFile(String filePath) {
        try {
            String normalizedPath = filePath.replace('\\', '/');
            log.debug("原始路径: {}, 标准化后: {}", filePath, normalizedPath);

            Path fullPath = Path.of(dataRoot, normalizedPath).toAbsolutePath().normalize();

            Path allowedRoot = Path.of(dataRoot, "upload").toAbsolutePath().normalize();
            if (!fullPath.startsWith(allowedRoot)) {
                log.error("检测到非法文件删除请求，路径超出允许范围: {}", filePath);
                return false;
            }

            File file = fullPath.toFile();
            log.debug("完整文件路径: {}", fullPath);
            
            if (file.exists() && file.isFile()) {
                if (!file.canWrite()) {
                    log.warn("文件没有写权限，无法删除: {}", fullPath);
                    return false;
                }
                
                boolean deleted = file.delete();
                if (deleted) {
                    log.info("成功删除文件: {}", fullPath);
                } else {
                    log.warn("文件删除失败: {}", fullPath);
                }
                return deleted;
            } else if (!file.exists()) {
                log.warn("文件不存在，可能已被删除: {}", fullPath);
                return true;
            } else {
                log.warn("路径不是普通文件，跳过删除: {}", fullPath);
                return false;
            }
        } catch (Exception e) {
            log.error("物理删除文件时发生错误，路径: {}", filePath, e);
            return false;
        }
    }
}