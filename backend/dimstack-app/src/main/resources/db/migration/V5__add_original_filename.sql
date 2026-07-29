ALTER TABLE `attachment`
    ADD COLUMN `original_filename` VARCHAR(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '原始文件名'
        AFTER `attachment_id`;