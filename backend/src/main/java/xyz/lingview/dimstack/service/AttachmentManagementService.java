package xyz.lingview.dimstack.service;


import xyz.lingview.dimstack.domain.StorageMigrationLog;

import java.util.List;
import java.util.Map;

/**
 * @Author: lingview
 * @Date: 2026/02/08 17:30:00
 * @Description: 附件管理服务接口
 * @Version: 1.0
 */
public interface AttachmentManagementService {

    Map<String, Object> getPage(int page, int size);

    Map<String, Object> getPageByUuid(String uuid, int page, int size);

    Map<String, Object> getPageWithRecentDeleted(int page, int size);

    Map<String, Object> getDeletedPageOnly(int page, int size);

    Map<String, Object> getPageByUuidWithRecentDeleted(String uuid, int page, int size);

    Map<String, Object> getDeletedPageByUuidOnly(String uuid, int page, int size);

    Map<String, Object> getPageByUserUuid(String userUuid, int page, int size);

    Map<String, Object> getPageByUserUuidWithDeleted(String userUuid, int page, int size);

    Map<String, Object> getDeletedPageByUserUuidOnly(String userUuid, int page, int size);

    boolean deleteAttachment(String attachmentId);

    int batchDeleteAttachments(List<String> attachmentIds);

    int batchRestoreAttachments(List<String> attachmentIds);

    boolean restoreAttachment(String attachmentId);

    String getAttachmentOwnerUuid(String attachmentId);

    boolean physicallyDeleteAttachment(String attachmentId);

    int batchPhysicallyDeleteAttachments(List<String> attachmentIds);

    Map<String, Object> migrateStorage(String sourceStorageId, String targetStorageId);

    Map<String, Object> retryMigrateStorage(String sourceStorageId, String targetStorageId, List<String> attachmentIds);

    List<StorageMigrationLog> getMigrateLogs();

    StorageMigrationLog getMigrateLogDetail(int id);

    int cleanupExpiredDeletedAttachments();
}