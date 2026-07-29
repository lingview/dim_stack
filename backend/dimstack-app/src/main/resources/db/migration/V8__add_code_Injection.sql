ALTER TABLE `site_config`
    ADD COLUMN `global_head_code` mediumtext CHARACTER SET utf8mb4 NULL COMMENT '全局Head标签代码注入'
        AFTER `enable_llm_create_article`;

ALTER TABLE `site_config`
    ADD COLUMN `content_head_code` mediumtext CHARACTER SET utf8mb4 NULL COMMENT '内容页Head标签代码注入'
        AFTER `global_head_code`;

ALTER TABLE `site_config`
    ADD COLUMN `footer_code` mediumtext CHARACTER SET utf8mb4 NULL COMMENT '页脚代码注入'
        AFTER `content_head_code`;