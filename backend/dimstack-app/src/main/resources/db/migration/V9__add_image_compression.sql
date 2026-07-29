ALTER TABLE `site_config`
    ADD COLUMN `enable_image_compression` int NULL DEFAULT 0 COMMENT '是否启用图片压缩（1：启用，0：禁用）'
        AFTER `footer_code`;
