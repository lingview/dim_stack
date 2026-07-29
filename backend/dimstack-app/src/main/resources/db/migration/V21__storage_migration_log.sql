CREATE TABLE `storage_migration_log` (
  `id`                int NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `source_storage_id` varchar(255) NOT NULL COMMENT '源存储UUID',
  `target_storage_id` varchar(255) NOT NULL COMMENT '目标存储UUID',
  `total`             int NOT NULL DEFAULT 0 COMMENT '总附件数',
  `success`           int NOT NULL DEFAULT 0 COMMENT '成功数',
  `failed`            int NOT NULL DEFAULT 0 COMMENT '失败数',
  `status`            int NOT NULL DEFAULT 0 COMMENT '状态：0-进行中，1-已完成，2-失败',
  `created_at`        datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_source`(`source_storage_id`),
  INDEX `idx_target`(`target_storage_id`),
  INDEX `idx_created_at`(`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='存储迁移记录';

CREATE TABLE `storage_migration_failed_item` (
  `id`            int NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `migration_id`  int NOT NULL COMMENT '关联迁移记录ID',
  `attachment_id` varchar(255) NOT NULL COMMENT '附件ID',
  `file_path`     varchar(255) NOT NULL COMMENT '文件路径',
  `error_msg`     text COMMENT '错误信息',
  `created_at`    datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_migration_id`(`migration_id`),
  CONSTRAINT `fk_migration_item` FOREIGN KEY (`migration_id`) REFERENCES `storage_migration_log`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='迁移失败明细';