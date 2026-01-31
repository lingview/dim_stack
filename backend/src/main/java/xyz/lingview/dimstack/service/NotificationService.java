package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.domain.SystematicNotification;
import xyz.lingview.dimstack.dto.request.PageResult;

/**
 * @Author: lingview
 * @Date: 2026/01/31 16:07:35
 * @Description: 系统通知服务
 * @Version: 1.0
 */
public interface NotificationService {

    void sendSystemNotification(String username, String type, String content);

    PageResult<SystematicNotification> getSystematicNotifications(String uuid, int pageNum, int pageSize);

    PageResult<SystematicNotification> getReadNotifications(String uuid, int pageNum, int pageSize);

    PageResult<SystematicNotification> getUnreadNotifications(String uuid, int pageNum, int pageSize);

    boolean updateNotificationStatus(Integer id, String uuid);

    boolean deleteSystematicNotification(Integer id, String uuid);

}
