DROP TABLE IF EXISTS `announcement`;
CREATE TABLE `announcement` (
    `id` int NOT NULL AUTO_INCREMENT,
    `content` text CHARACTER SET utf8mb4 NOT NULL COMMENT '公告内容(HTML)',
    `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COMMENT = '公告表' ROW_FORMAT = Dynamic;

INSERT INTO `permission` VALUES (60, 'system:announcement:management', '公告管理', 'announcement', NOW());
INSERT INTO `permission` VALUES (61, 'announcement:menus', '公告管理菜单', 'menus', NOW());

INSERT INTO `dashboard_menu` VALUES (111, '公告管理', 'announcement', '/dashboard/announcement', 5, 'announcement:menus', 30, NOW(), 'sidebar');

INSERT INTO `role_permission` VALUES (1, 60);
INSERT INTO `role_permission` VALUES (1, 61);
