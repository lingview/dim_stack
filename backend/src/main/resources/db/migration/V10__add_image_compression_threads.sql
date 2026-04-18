ALTER TABLE `site_config`
    ADD COLUMN `image_compression_threads` int NULL DEFAULT 5 COMMENT '图片压缩处理线程数'
        AFTER `enable_image_compression`;
