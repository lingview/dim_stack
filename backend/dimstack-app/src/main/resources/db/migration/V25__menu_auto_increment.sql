ALTER TABLE `dashboard_menu` DROP FOREIGN KEY `fk_menu_parent_id`;
ALTER TABLE `dashboard_menu` MODIFY COLUMN `id` INT NOT NULL AUTO_INCREMENT;
ALTER TABLE `dashboard_menu` ADD CONSTRAINT `fk_menu_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `dashboard_menu` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
