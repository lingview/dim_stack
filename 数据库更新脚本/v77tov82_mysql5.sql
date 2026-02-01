INSERT INTO `dashboard_menu` VALUES (46, '更新', 'update', '/dashboard/update', 5, 'system:edit', 20, '2025-12-04 21:42:15', 'sidebar');

CREATE TABLE `systematic_notification`  (
                                            `id` int NOT NULL AUTO_INCREMENT,
                                            `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '所属用户的uuid',
                                            `content` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知内容',
                                            `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                            `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '通知类型',
                                            `status` int NOT NULL COMMENT '通知状态2为未读，1为已读，0为删除',
                                            PRIMARY KEY (`id`) USING BTREE,
                                            INDEX `fk_systematic_notification_user_uuid`(`uuid` ASC) USING BTREE,
                                            CONSTRAINT `fk_systematic_notification_user_uuid` FOREIGN KEY (`uuid`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;
