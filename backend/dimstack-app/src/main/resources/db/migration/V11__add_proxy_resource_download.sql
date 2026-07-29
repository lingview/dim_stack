-- 添加外部资源代理下载开关字段
ALTER TABLE site_config ADD COLUMN proxy_resource_download INT DEFAULT 0 COMMENT '是否启用外部资源代理下载：0-禁用，1-启用';
