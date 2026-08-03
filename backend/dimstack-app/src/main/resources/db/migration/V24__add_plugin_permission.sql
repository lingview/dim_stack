-- 插件管理权限与后台菜单(阶段 2: 插件生命周期管理)
INSERT INTO `permission` VALUES (64, 'plugin:management', '插件管理', 'plugin', NOW());
INSERT INTO `permission` VALUES (65, 'plugin:menus', '插件管理菜单', 'menus', NOW());

INSERT INTO `dashboard_menu` VALUES (113, '插件管理', 'plugin', '/dashboard/plugins', 5, 'plugin:menus', 30, NOW(), 'sidebar');

INSERT INTO `role_permission` VALUES (1, 64);
INSERT INTO `role_permission` VALUES (1, 65);
