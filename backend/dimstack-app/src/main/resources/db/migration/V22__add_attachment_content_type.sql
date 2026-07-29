ALTER TABLE `attachment`
  ADD COLUMN `content_type` varchar(255) DEFAULT NULL COMMENT '文件MIME类型'
  AFTER `storage_id`;
