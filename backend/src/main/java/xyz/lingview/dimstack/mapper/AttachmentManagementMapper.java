package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import xyz.lingview.dimstack.domain.AttachmentManagement;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/02/08 16:45:31
 * @Description: 附件管理
 * @Version: 1.0
 */
@Mapper
public interface AttachmentManagementMapper {

    // 根据uuid查询全部附件
    AttachmentManagement selectByUuid(String uuid);

    // 分页查询附件(管理员)
    List<AttachmentManagement> selectPage(@Param("offset") int offset, @Param("limit") int limit);

    // 查询附件总数
    int countAll();

    // 删除附件
    int deleteByAttachmentId(@Param("attachmentId") String attachmentId, @Param("deletedTime") LocalDateTime deletedTime);

    // 基于UUID分页查询附件列表
    List<AttachmentManagement> selectPageByUuid(@Param("uuid") String uuid, @Param("offset") int offset, @Param("limit") int limit);

    // 基于UUID查询附件总数
    int countByUuid(@Param("uuid") String uuid);

    // 根据attachmentId查询附件
    AttachmentManagement selectByAttachmentId(String attachmentId);

    // 撤销删除附件
    int restoreAttachment(@Param("attachmentId") String attachmentId);

    // 分页查询所有附件（包含最近删除的，6小时内）
    List<AttachmentManagement> selectAllPageWithRecentDeleted(@Param("offset") int offset, @Param("limit") int limit);

    // 查询所有附件总数（包含最近删除的，6小时内）
    int countAllWithRecentDeleted();

    // 分页查询所有附件（仅已删除的，6小时内）
    List<AttachmentManagement> selectDeletedOnlyPage(@Param("offset") int offset, @Param("limit") int limit);

    // 查询所有已删除附件总数（6小时内）
    int countDeletedOnly();

    // 基于UUID分页查询附件（包含最近删除的，6小时内）
    List<AttachmentManagement> selectPageByUuidWithRecentDeleted(@Param("uuid") String uuid, @Param("offset") int offset, @Param("limit") int limit);

    // 基于UUID查询附件总数（包含最近删除的，6小时内）
    int countByUuidWithRecentDeleted(@Param("uuid") String uuid);

    // 基于UUID分页查询附件（仅已删除的，6小时内）
    List<AttachmentManagement> selectDeletedOnlyPageByUuid(@Param("uuid") String uuid, @Param("offset") int offset, @Param("limit") int limit);

    // 基于UUID查询已删除附件总数（6小时内）
    int countDeletedOnlyByUuid(@Param("uuid") String uuid);
    
    // 根据用户UUID分页查询附件（正常状态）
    List<AttachmentManagement> selectPageByUserUuid(@Param("userUuid") String userUuid, @Param("offset") int offset, @Param("limit") int limit);
    
    // 根据用户UUID查询附件总数（正常状态）
    int countByUserUuid(@Param("userUuid") String userUuid);
    
    // 根据用户UUID分页查询附件（包含删除状态，6小时内）
    List<AttachmentManagement> selectPageByUserUuidWithDeleted(@Param("userUuid") String userUuid, @Param("offset") int offset, @Param("limit") int limit);
    
    // 根据用户UUID查询附件总数（包含删除状态，6小时内）
    int countByUserUuidWithDeleted(@Param("userUuid") String userUuid);
    
    // 根据用户UUID分页查询已删除附件（仅已删除的，6小时内）
    List<AttachmentManagement> selectDeletedOnlyPageByUserUuid(@Param("userUuid") String userUuid, @Param("offset") int offset, @Param("limit") int limit);
    
    // 根据用户UUID查询已删除附件总数（6小时内）
    int countDeletedOnlyByUserUuid(@Param("userUuid") String userUuid);
    
    // 查询删除超过6小时的附件
    List<AttachmentManagement> selectExpiredDeletedAttachments();
    
    // 物理删除附件记录（将状态改为2）
    int physicallyDeleteAttachment(@Param("attachmentId") String attachmentId);
}