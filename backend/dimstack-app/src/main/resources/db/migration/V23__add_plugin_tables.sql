-- 插件注册表与插件配置表(阶段 2: 插件生命周期管理)
CREATE TABLE IF NOT EXISTS `plugin` (
  `id`              BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name`            VARCHAR(64)  NOT NULL COMMENT '插件ID(唯一)',
  `version`         VARCHAR(32)  NOT NULL COMMENT '插件版本(semver)',
  `display_name`    VARCHAR(128) NOT NULL COMMENT '插件中文名',
  `description`     VARCHAR(512)          DEFAULT NULL COMMENT '插件描述',
  `author`          VARCHAR(128)          DEFAULT NULL COMMENT '插件作者',
  `requires`        VARCHAR(32)           DEFAULT NULL COMMENT '宿主版本约束',
  `jar_file`        VARCHAR(255) NOT NULL COMMENT '插件文件相对路径',
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
