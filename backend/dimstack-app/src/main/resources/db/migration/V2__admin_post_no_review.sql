ALTER TABLE `site_config`
    ADD COLUMN `admin_post_no_review` INT NULL DEFAULT 0 COMMENT '管理员文章是否无需审核（1：启用，0：禁用）';