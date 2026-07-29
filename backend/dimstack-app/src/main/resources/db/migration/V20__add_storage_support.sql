CREATE TABLE `storage_method` (
  `uuid`       varchar(255) NOT NULL COMMENT '存储方式唯一标识',
  `user_uuid`  varchar(255) DEFAULT NULL COMMENT '创建人UUID，关联管理员用户表',
  `name`       varchar(255) DEFAULT NULL COMMENT '存储方式名称，如：本地存储、阿里云OSS',
  `type`       varchar(255) DEFAULT NULL COMMENT '存储类型：local、s3、oss、cos等',
  `config`     text         COMMENT '存储配置信息，JSON字符串格式',
  `status`     int NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
  INDEX `idx_type`(`type`),
  INDEX `idx_status`(`status`),
  INDEX `user_uuid`(`user_uuid`),
  CONSTRAINT `storage_method_ibfk_1` FOREIGN KEY (`user_uuid`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='存储方式管理表';

INSERT INTO `storage_method` (`uuid`, `user_uuid`, `name`, `type`, `config`, `status`)
SELECT 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4f47ac10b48bf511eb9a5eb9b5a8f1c2d172121853800042356789', `uuid`, 'local', 'local', NULL, 1
FROM `user_information`
ORDER BY `create_time` ASC
LIMIT 1;

ALTER TABLE `site_config`
  ADD COLUMN `default_storage` varchar(255) DEFAULT NULL COMMENT '默认存储方式UUID'
  AFTER `admin_comment_no_review`;

UPDATE `site_config` s
SET s.`default_storage` = (SELECT `uuid` FROM `storage_method` WHERE `name` = 'local')
WHERE s.`id` = 1;

ALTER TABLE `attachment`
  ADD COLUMN `storage_id` varchar(255) DEFAULT NULL COMMENT '存储方式UUID'
  AFTER `access_key`;

UPDATE `attachment` a
SET a.`storage_id` = (SELECT `uuid` FROM `storage_method` WHERE `name` = 'local');