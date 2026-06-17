ALTER TABLE `site_config`
    ADD COLUMN `enable_music` int NULL DEFAULT NULL COMMENT '是否启用悬浮音乐播放器（1：启用，0：禁用）' AFTER `enable_register`;

CREATE TABLE `music`  (
                          `id` int NOT NULL AUTO_INCREMENT,
                          `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '上传用户uuid',
                          `music_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '曲名',
                          `music_author` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '曲作者',
                          `music_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文件地址',
                          `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                          `status` int NOT NULL COMMENT '0为删除1为正常',
                          PRIMARY KEY (`id`) USING BTREE,
                          INDEX `fk_music_user_uuid`(`uuid` ASC) USING BTREE,
                          CONSTRAINT `fk_music_user_uuid` FOREIGN KEY (`uuid`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;
