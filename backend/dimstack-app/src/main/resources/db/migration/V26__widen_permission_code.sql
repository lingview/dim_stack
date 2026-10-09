ALTER TABLE `dashboard_menu` DROP FOREIGN KEY `fk_menu_permission_code`;
ALTER TABLE `permission` MODIFY COLUMN `code` varchar(100) CHARACTER SET utf8mb4 NOT NULL COMMENT '权限码，如 post:view';
ALTER TABLE `dashboard_menu` MODIFY COLUMN `permission_code` varchar(100) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '访问此菜单所需的权限码，如 system:edit';
ALTER TABLE `dashboard_menu` ADD CONSTRAINT `fk_menu_permission_code` FOREIGN KEY (`permission_code`) REFERENCES `permission` (`code`) ON DELETE SET NULL ON UPDATE CASCADE;
