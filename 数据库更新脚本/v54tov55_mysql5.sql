INSERT INTO `dashboard_menu` VALUES (45, '自定义页面', 'page', '/dashboard/custom-pages', 3, 'system:edit', 20, '2025-12-04 21:42:15', 'sidebar');


CREATE TABLE `custom_page`  (
                                `id` int NOT NULL AUTO_INCREMENT,
                                `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
                                `page_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '页面名',
                                `page_code` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '页面代码',
                                `alias` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '访问地址',
                                `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '页面创建时间',
                                `status` int NOT NULL COMMENT '页面状态0为删除1为正常',
                                PRIMARY KEY (`id`) USING BTREE,
                                UNIQUE INDEX `alias`(`alias` ASC) USING BTREE COMMENT '页面访问地址',
                                INDEX `uuid`(`uuid` ASC) USING BTREE,
                                CONSTRAINT `fk_custom_page_user_uuid` FOREIGN KEY (`uuid`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;