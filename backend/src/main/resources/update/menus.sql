ALTER TABLE `menus`
    ADD COLUMN `sort_order` int NULL COMMENT '菜单的显示顺序'
        AFTER `menus_url`;

SET @row_number = -1;
UPDATE `menus`
SET `sort_order` = (@row_number := @row_number + 1)
WHERE `status` = 1
ORDER BY `id`;

ALTER TABLE `menus`
    MODIFY COLUMN `sort_order` int NOT NULL COMMENT '菜单的显示顺序';

SELECT `id`, `menus_id`, `menus_name`, `sort_order`, `status`
FROM `menus`
WHERE `status` = 1
ORDER BY `sort_order`;