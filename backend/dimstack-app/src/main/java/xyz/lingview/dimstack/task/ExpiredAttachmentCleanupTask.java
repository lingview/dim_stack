package xyz.lingview.dimstack.task;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import xyz.lingview.dimstack.service.AttachmentManagementService;

/**
 * @Author: lingview
 * @Date: 2026/02/09
 * @Description: 过期附件清理定时任务
 * @Version: 1.0
 */
@Component
@Slf4j
public class ExpiredAttachmentCleanupTask {

    @Autowired
    private AttachmentManagementService attachmentManagementService;

    @Scheduled(fixedRate = 3 * 60 * 60 * 1000)
    public void cleanupExpiredAttachments() {
        try {
            log.info("开始执行过期附件清理任务...");
            
            int cleanedCount = attachmentManagementService.cleanupExpiredDeletedAttachments();
            
            log.info("过期附件清理任务完成，共清理 {} 个附件", cleanedCount);
        } catch (Exception e) {
            log.error("执行过期附件清理任务时发生错误", e);
        }
    }

}