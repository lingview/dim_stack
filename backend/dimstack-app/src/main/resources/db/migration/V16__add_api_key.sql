CREATE TABLE IF NOT EXISTS `api_key`  (
                            `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
                            `user_id` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '所属用户UUID',
                            `key_hash` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT 'SHA-256哈希，替代原api_key明文',
                            `description` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '备注描述',
                            `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            `status` int UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
                            PRIMARY KEY (`id`) USING BTREE,
                            UNIQUE INDEX `uk_key_hash`(`key_hash` ASC) USING BTREE,
                            INDEX `idx_user_status`(`user_id` ASC, `status` ASC) USING BTREE,
                            CONSTRAINT `api_key_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_information` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COMMENT = 'API Key表' ROW_FORMAT = Dynamic;
