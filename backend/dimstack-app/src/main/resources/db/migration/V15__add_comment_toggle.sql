ALTER TABLE `site_config` ADD COLUMN `enable_comment` INT NULL DEFAULT 1 COMMENT '是否启用评论区（1：启用，0：禁用）';
ALTER TABLE `article` ADD COLUMN `enable_comment` TINYINT NOT NULL DEFAULT 1 COMMENT '文章是否开启评论区（1：开启，0：关闭）';
