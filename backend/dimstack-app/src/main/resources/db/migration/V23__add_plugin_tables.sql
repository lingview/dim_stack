-- 插件系统完整迁移(注册表/配置表/管理权限/后台菜单/完整性校验字段)
-- 说明: 原 V23/V24/V25 三个脚本在开发阶段合并为一个; 脚本保持幂等
-- (CREATE TABLE IF NOT EXISTS + INSERT IGNORE), 已执行过的库清理 Flyway 历史后重放安全。
CREATE TABLE IF NOT EXISTS `plugin` (
  `id`              BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name`            VARCHAR(64)  NOT NULL COMMENT '插件ID(唯一)',
  `version`         VARCHAR(32)  NOT NULL COMMENT '插件版本(semver)',
  `display_name`    VARCHAR(128) NOT NULL COMMENT '插件中文名',
  `description`     VARCHAR(512)          DEFAULT NULL COMMENT '插件描述',
  `author`          VARCHAR(128)          DEFAULT NULL COMMENT '插件作者',
  `requires`        VARCHAR(32)           DEFAULT NULL COMMENT '宿主版本约束',
  `jar_file`        VARCHAR(255) NOT NULL COMMENT '插件文件相对路径',
  `sha256`          VARCHAR(64)           DEFAULT NULL COMMENT '插件jar完整性校验值(SHA-256 hex)',
  `enabled`         TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '启用状态: 0-停用, 1-启用',
  `setting_name`    VARCHAR(64)           DEFAULT NULL COMMENT '设置表单扩展名(阶段5)',
  `config_map_name` VARCHAR(64)           DEFAULT NULL COMMENT '配置存储名(阶段5)',
  `create_time`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `uk_plugin_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='插件注册表';

CREATE TABLE IF NOT EXISTS `plugin_config` (
  `id`           BIGINT AUTO_INCREMENT PRIMARY KEY,
  `plugin_name`  VARCHAR(64)  NOT NULL COMMENT '插件ID',
  `config_key`   VARCHAR(64)  NOT NULL COMMENT '配置键',
  `config_value` TEXT COMMENT '配置值(JSON字符串)',
  `update_time`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `uk_plugin_config` (`plugin_name`, `config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='插件配置表';

-- 插件管理权限与后台菜单
INSERT IGNORE INTO `permission` VALUES (64, 'plugin:management', '插件管理', 'plugin', NOW());
INSERT IGNORE INTO `permission` VALUES (65, 'plugin:menus', '插件管理菜单', 'menus', NOW());

INSERT IGNORE INTO `dashboard_menu` VALUES (113, '插件管理', 'plugin', '/dashboard/plugins', 5, 'plugin:menus', 30, NOW(), 'sidebar');

INSERT IGNORE INTO `role_permission` VALUES (1, 64);
INSERT IGNORE INTO `role_permission` VALUES (1, 65);
