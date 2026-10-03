-- 插件SQL审计表: 只记录DDL/写宿主核心表/慢SQL, 供管理员核查插件行为
CREATE TABLE IF NOT EXISTS `plugin_sql_audit` (
  `id`          BIGINT AUTO_INCREMENT PRIMARY KEY,
  `plugin_name` VARCHAR(64)   NOT NULL COMMENT '插件ID',
  `category`    VARCHAR(32)   NOT NULL COMMENT 'ddl-结构变更, core_write-写核心表, slow-慢SQL',
  `sql_text`    VARCHAR(2048)          DEFAULT NULL COMMENT 'SQL文本(超长截断)',
  `cost_millis` BIGINT                 DEFAULT NULL COMMENT '执行耗时(毫秒)',
  `create_time` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
  KEY `idx_plugin_name_id` (`plugin_name`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='插件SQL审计';
