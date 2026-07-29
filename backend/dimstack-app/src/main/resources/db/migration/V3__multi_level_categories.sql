-- 删除 article 表的旧外键（依赖 category -> article_categories.article_categories）
ALTER TABLE `article` DROP FOREIGN KEY `categories`;


-- 升级 article_categories 表，支持多级分类

-- 创建新分类表结构
CREATE TABLE `article_categories_new` (
                                          `id` int NOT NULL AUTO_INCREMENT,
                                          `parent_id` int NULL DEFAULT NULL COMMENT '父分类ID，NULL 表示顶级分类',
                                          `article_categories` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '分类名称',
                                          `categories_explain` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '分类说明',
                                          `founder` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '创建人',
                                          `article_count` int NOT NULL DEFAULT 0 COMMENT '文章数量',
                                          `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
                                          `status` int NOT NULL COMMENT '分类状态：0=禁用, 1=启用',
                                          PRIMARY KEY (`id`) USING BTREE,
                                          UNIQUE INDEX `uk_category_name_parent` (`article_categories`, `parent_id`),
                                          INDEX `idx_parent_id` (`parent_id`),
                                          INDEX `categories_founder` (`founder`),
                                          CONSTRAINT `categories_founder_new`
                                              FOREIGN KEY (`founder`) REFERENCES `user_information` (`uuid`)
                                                  ON DELETE SET NULL ON UPDATE SET NULL,
                                          CONSTRAINT `fk_parent_category`
                                              FOREIGN KEY (`parent_id`) REFERENCES `article_categories_new` (`id`)
                                                  ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 ROW_FORMAT = DYNAMIC;

-- 迁移数据（parent_id = NULL）
INSERT INTO `article_categories_new`
(`id`, `parent_id`, `article_categories`, `categories_explain`, `founder`, `article_count`, `create_time`, `status`)
SELECT
    `id`, NULL, `article_categories`, `categories_explain`, `founder`, `article_count`, `create_time`, `status`
FROM `article_categories`;

-- 动态设置自增值
SET @max_id = (SELECT COALESCE(MAX(id), 0) + 1 FROM `article_categories_new`);
SET @sql = CONCAT('ALTER TABLE `article_categories_new` AUTO_INCREMENT = ', @max_id);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 切换表
RENAME TABLE
    `article_categories` TO `article_categories_backup`,
    `article_categories_new` TO `article_categories`;


-- 升级 article 表 引入 category_id 并删除 category 字段
-- 添加 category_id 字段
ALTER TABLE `article`
    ADD COLUMN `category_id` int NULL DEFAULT NULL COMMENT '文章分类ID（关联 article_categories.id）'
        AFTER `password`;

-- 填充数据
UPDATE `article` a
    JOIN `article_categories` c ON a.`category` = c.`article_categories`
SET a.`category_id` = c.`id`;

-- 设为非空
ALTER TABLE `article` MODIFY `category_id` int NOT NULL;

-- 删除旧 category 字段
ALTER TABLE `article` DROP COLUMN `category`;

-- 添加外键
ALTER TABLE `article`
    ADD CONSTRAINT `fk_article_category_id`
        FOREIGN KEY (`category_id`) REFERENCES `article_categories` (`id`)
            ON DELETE RESTRICT
            ON UPDATE CASCADE;
