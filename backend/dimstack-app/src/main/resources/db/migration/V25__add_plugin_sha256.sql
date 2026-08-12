-- 插件完整性校验字段(阶段 6: 安全加固)
ALTER TABLE `plugin`
  ADD COLUMN `sha256` varchar(64) DEFAULT NULL COMMENT '插件jar完整性校验值(SHA-256 hex)'
  AFTER `jar_file`;
