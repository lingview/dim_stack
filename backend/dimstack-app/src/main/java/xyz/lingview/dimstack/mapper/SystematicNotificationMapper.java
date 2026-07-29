package xyz.lingview.dimstack.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import xyz.lingview.dimstack.domain.SystematicNotification;

import java.util.List;

/**
 * @Author: lingview
 * @Date: 2026/01/31 12:40:48
 * @Description: 系统通知
 * @Version: 1.0
 */
@Mapper
public interface SystematicNotificationMapper {

    // 插入通知
    int insertSystematicNotification(SystematicNotification systematicNotification);

    // 获取用户通知总数
    int getCountByUuid(@Param("uuid") String uuid);

    // 获取用户已读通知总数
    int getReadCountByUuid(@Param("uuid") String uuid);

    // 获取用户未读通知总数
    int getUnreadCountByUuid(@Param("uuid") String uuid);

    // 获取用户通知列表
    List<SystematicNotification> getSystematicNotificationsWithPagination(
            @Param("uuid") String uuid,
            @Param("offset") int offset,
            @Param("limit") int limit);

    // 获取用户已读通知列表
    List<SystematicNotification> getReadNotificationsWithPagination(
            @Param("uuid") String uuid,
            @Param("offset") int offset,
            @Param("limit") int limit);

    // 获取用户未读通知列表
    List<SystematicNotification> getUnreadNotificationsWithPagination(
            @Param("uuid") String uuid,
            @Param("offset") int offset,
            @Param("limit") int limit);

    // 通知标为已读
    int updateNotificationStatus(@Param("id") Integer id, @Param("status") Integer status);

    // 删除通知
    int deleteSystematicNotification(@Param("id") Integer id);

    // 根据ID和UUID查询通知
    SystematicNotification selectByIdAndUuid(@Param("id") Integer id, @Param("uuid") String uuid);

}
