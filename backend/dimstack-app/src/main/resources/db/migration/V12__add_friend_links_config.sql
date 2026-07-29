DROP TABLE IF EXISTS `friend_links_config`;
CREATE TABLE `friend_links_config`  (
                                        `id` int NOT NULL AUTO_INCREMENT,
                                        `site_name` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '站点名称',
                                        `site_url` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '站点url',
                                        `site_logo` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '站点图标',
                                        `description` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '站点描述',
                                        `apply_rules` text CHARACTER SET utf8mb4 NULL COMMENT '友链申请规则说明',
                                        `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                        `status` int NULL DEFAULT NULL COMMENT '站点状态1为启用，0为删除',
                                        PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 ROW_FORMAT = Dynamic;