package xyz.lingview.dimstack.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import xyz.lingview.dimstack.domain.AttachmentManagement;
import xyz.lingview.dimstack.mapper.AttachmentManagementMapper;
import xyz.lingview.dimstack.mapper.UserInformationMapper;
import xyz.lingview.dimstack.service.AttachmentManagementService;

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
public class AttachmentManagementServiceImpl implements AttachmentManagementService {
    
    @Autowired
    private AttachmentManagementMapper attachmentManagementMapper;
    
    @Autowired
    private UserInformationMapper userInformationMapper;
    
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
        int result = attachmentManagementMapper.deleteByUuid(attachmentId, deletedTime);
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
}