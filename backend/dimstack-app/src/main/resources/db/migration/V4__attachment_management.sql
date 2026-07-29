ALTER TABLE `attachment`
    ADD COLUMN `deleted_time` datetime NULL COMMENT '删除时间' AFTER `create_time`;

ALTER TABLE `attachment`
    MODIFY COLUMN `create_time`
        datetime NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        COMMENT '上传时间';

UPDATE `attachment`
SET `deleted_time` = `create_time`
WHERE `status` = 0
  AND `deleted_time` IS NULL;


INSERT INTO `dashboard_menu` VALUES (108, '全局附件管理', 'attachment', '/dashboard/global-attachments', 3, 'system:edit', 46, '2026-02-08 20:50:15', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (109, '我的附件', 'upload', '/dashboard/my-attachments', 3, NULL, 47, '2026-02-08 20:50:19', 'sidebar');

