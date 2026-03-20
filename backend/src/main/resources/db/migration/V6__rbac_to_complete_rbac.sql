DROP TABLE IF EXISTS `dashboard_menu`;
DROP TABLE IF EXISTS `role_permission`;
DROP TABLE IF EXISTS `permission`;



CREATE TABLE `permission`  (
                               `id` int NOT NULL AUTO_INCREMENT COMMENT '权限ID',
                               `code` varchar(50) CHARACTER SET utf8mb4 NOT NULL COMMENT '权限码，如 post:view',
                               `name` varchar(100) CHARACTER SET utf8mb4 NOT NULL COMMENT '权限名称，如 查看文章',
                               `module` varchar(50) CHARACTER SET utf8mb4 NOT NULL COMMENT '所属模块，如 post, user, system',
                               `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                               PRIMARY KEY (`id`) USING BTREE,
                               UNIQUE INDEX `idx_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 60 CHARACTER SET = utf8mb4 COMMENT = '权限表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of permission
-- ----------------------------
INSERT INTO `permission` VALUES (1, 'system:attachment:view', '查看任意附件', 'attachment', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (2, 'system:attachment:delete', '删除任意附件', 'attachment', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (3, 'system:attachment:undelete', '撤销删除任意附件', 'attachment', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (4, 'system:attachment:management', '系统附件管理完整操作', 'attachment', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (5, 'attachment:add', '添加附件', 'attachment', '2026-03-19 22:16:25');
INSERT INTO `permission` VALUES (6, 'attachment:view', '查看自己附件', 'attachment', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (7, 'attachment:delete', '删除自己附件', 'attachment', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (8, 'attachment:undelete', '撤销删除自己附件', 'attachment', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (9, 'attachment:edit', '管理自己附件（完整操作）', 'attachment', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (10, 'system:comments:view', '查看任意评论', 'comments', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (11, 'system:comments:edit', '编辑任意评论', 'comments', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (12, 'system:comments:delete', '删除任意评论', 'comments', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (13, 'system:comments:management', '评论管理（完整操作）', 'comments', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (14, 'comments:add', '用户评论', 'comments', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (15, 'comments:delete', '删除自己评论', 'comments', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (16, 'comments:like', '点赞评论', 'comments', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (17, 'comments:edit', '评论完整操作', 'comments', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (18, 'system:post:review', '审核文章', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (19, 'system:custompage:add', '添加自定义页面', 'custompage', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (20, 'system:custompage:update', '更新自定义页面', 'custompage', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (21, 'system:custompage:delete', '删除自定义页面', 'custompage', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (22, 'system:custompage:view', '获取自己的自定义页面', 'custompage', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (23, 'system:custompage:management', '自定义页面完整操作', 'custompage', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (24, 'post:view', '获取文章列表', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (25, 'post:add', '用户创建文章', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (26, 'post:update', '用户更新文章', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (27, 'post:details', '获取文章详情', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (28, 'post:delete', '删除自己文章', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (29, 'post:unpublish', '取消发布文章', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (30, 'post:publish', '发布文章', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (31, 'post:removepassword', '移除文章密码', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (32, 'post:edit', '编辑文章（对自己文章完整操作）', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (33, 'system:theme:management', '系统主题管理', 'theme', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (34, 'system:friendlinks:management', '系统友链管理', 'friendlinks', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (35, 'system:menus:management', '系统菜单管理', 'menu', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (36, 'system:music:management', '系统音乐管理', 'config', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (37, 'system:role:management', '系统角色管理', 'role', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (38, 'system:config:management', '系统配置管理', 'config', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (39, 'system:tags:management', '系统标签管理', 'tags', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (40, 'system:categories:management', '系统分类管理', 'categories', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (41, 'system:update:management', '系统更新管理', 'update', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (42, 'system:user:management', '管理用户信息', 'user', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (43, 'content:menus', '内容管理菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (44, 'user:menus', '用户管理菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (45, 'custompages:menus', '自定义页面菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (46, 'article:menus', '文章管理菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (47, 'articlereview:menus', '文章审核菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (48, 'comments:menus', '评论管理菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (49, 'tags:menus', '标签管理菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (50, 'categories:menus', '分类管理菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (51, 'friendlinks:menus', '友链管理菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (52, 'globalattachments:menus', '全局附件菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (53, 'attachments:menus', '我的附件菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (54, 'menus:menus', '菜单管理菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (55, 'settings:menus', '系统设置菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (56, 'config:menus', '配置管理菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (57, 'update:menus', '系统更新菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (58, 'theme:menus', '主题管理菜单', 'menus', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (59, 'role:menus', '角色管理菜单', 'menus', '2026-03-19 20:11:55');


CREATE TABLE `dashboard_menu`  (
                                   `id` int NOT NULL COMMENT '菜单ID',
                                   `title` varchar(100) CHARACTER SET utf8mb4 NOT NULL COMMENT '菜单标题，如“站点设置”',
                                   `icon` varchar(50) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '图标名称',
                                   `link` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '路由链接，父菜单可为空',
                                   `parent_id` int NULL DEFAULT NULL COMMENT '父级菜单ID，NULL表示顶级菜单',
                                   `permission_code` varchar(50) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '访问此菜单所需的权限码，如 system:edit',
                                   `sort_order` int NULL DEFAULT 0 COMMENT '排序权重，值越小越靠前',
                                   `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
                                   `type` enum('sidebar','quick_action') CHARACTER SET utf8mb4 NULL DEFAULT 'sidebar' COMMENT '菜单类型',
                                   PRIMARY KEY (`id`) USING BTREE,
                                   INDEX `idx_parent_id`(`parent_id` ASC) USING BTREE,
                                   INDEX `idx_link`(`link` ASC) USING BTREE,
                                   INDEX `idx_permission_code`(`permission_code` ASC) USING BTREE,
                                   INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE,
                                   CONSTRAINT `fk_menu_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `dashboard_menu` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
                                   CONSTRAINT `fk_menu_permission_code` FOREIGN KEY (`permission_code`) REFERENCES `permission` (`code`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COMMENT = '仪表盘菜单表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of dashboard_menu
-- ----------------------------
INSERT INTO `dashboard_menu` VALUES (1, '仪表盘', 'dashboard', '/dashboard', NULL, NULL, 10, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (2, '个人中心', 'user', '/dashboard/profile', NULL, NULL, 20, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (3, '内容', 'content', NULL, NULL, NULL, 30, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (5, '设置', 'settings', NULL, NULL, 'settings:menus', 50, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (21, '文章', 'article', '/dashboard/articles', 3, 'article:menus', 20, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (22, '文章审核', 'review', '/dashboard/articlesreview', 3, 'articlereview:menus', 30, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (24, '评论', 'comment', '/dashboard/comments', 3, 'comments:menus', 40, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (25, '菜单', 'menus', '/dashboard/menus', 3, 'menus:menus', 50, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (42, '用户', 'users', '/dashboard/users', 3, 'user:menus', 10, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (43, '站点信息', 'info', '/dashboard/settings', 5, 'config:menus', 10, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (44, '主题管理', 'theme', '/dashboard/themes', 5, 'theme:menus', 20, '2025-09-24 16:52:43', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (45, '自定义页面', 'page', '/dashboard/custom-pages', 3, 'custompages:menus', 20, '2025-12-04 21:42:15', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (46, '更新', 'update', '/dashboard/update', 5, 'update:menus', 20, '2025-12-04 21:42:15', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (101, '个人中心', 'user', '/dashboard/profile', NULL, NULL, 10, '2025-09-13 11:12:42', 'quick_action');
INSERT INTO `dashboard_menu` VALUES (103, '创建文章', 'edit', '/dashboard/articles/create', NULL, 'article:menus', 20, '2025-09-13 11:12:42', 'quick_action');
INSERT INTO `dashboard_menu` VALUES (104, '用户', 'users', '/dashboard/users', NULL, 'user:menus', 30, '2025-09-13 11:12:42', 'quick_action');
INSERT INTO `dashboard_menu` VALUES (105, '标签管理', 'tag', '/dashboard/tags', 3, 'tags:menus', 40, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (106, '分类管理', 'category', '/dashboard/categories', 3, 'categories:menus', 40, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (107, '友链管理', 'link', '/dashboard/friendlinks', 3, 'friendlinks:menus', 45, '2025-12-04 21:42:15', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (108, '全局附件管理', 'attachment', '/dashboard/global-attachments', 3, 'globalattachments:menus', 46, '2026-02-08 20:50:15', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (109, '我的附件', 'upload', '/dashboard/my-attachments', 3, 'attachments:menus', 47, '2026-02-08 20:50:19', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (110, '角色编辑', 'permission', '/dashboard/rbac-editor', 3, 'role:menus', 9, '2026-03-19 20:10:22', 'sidebar');


-- 禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

CREATE TEMPORARY TABLE temp_old_role_mapping AS
SELECT id AS old_role_id, code
FROM role;

-- 重建 role 表
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role`  (
                         `id` int NOT NULL AUTO_INCREMENT,
                         `code` varchar(50) CHARACTER SET utf8mb4 NOT NULL COMMENT '角色编码，如 AUTHOR',
                         `name` varchar(100) CHARACTER SET utf8mb4 NOT NULL COMMENT '角色名称，如 作者',
                         `description` text CHARACTER SET utf8mb4 NULL COMMENT '描述',
                         `status` tinyint NULL DEFAULT 1 COMMENT '状态：1启用，0禁用',
                         PRIMARY KEY (`id`) USING BTREE,
                         UNIQUE INDEX `idx_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COMMENT = '角色表' ROW_FORMAT = DYNAMIC;

INSERT INTO `role` VALUES (1, 'ADMIN', '管理员', '系统超级管理员，拥有最高权限，可管理用户、角色、权限、站点配置等所有功能，负责平台整体运行与安全。', 1);
INSERT INTO `role` VALUES (2, 'OPERATOR ', '操作员', '负责平台运营，拥有部分系统配置权限', 1);
INSERT INTO `role` VALUES (3, 'POST_MANAGER', '文章管理员', '负责内容运营管理的角色，可以审核、发布、修改和删除任何文章，管理评论，维护内容质量和平台秩序。', 1);
INSERT INTO `role` VALUES (4, 'AUTHOR', '作者', '内容创作者角色，可以创建、编辑、删除自己的文章，并提交文章进入审核流程，等待管理员发布。', 1);
INSERT INTO `role` VALUES (5, 'READER', '阅读者', '可以浏览和阅读已发布的文章内容，参与评论互动，但无法创建或编辑文章。', 1);



CREATE TABLE `role_permission`  (
                                    `role_id` int NOT NULL COMMENT '角色ID',
                                    `permission_id` int NOT NULL COMMENT '权限ID',
                                    PRIMARY KEY (`role_id`, `permission_id`) USING BTREE,
                                    INDEX `idx_permission_id`(`permission_id` ASC) USING BTREE,
                                    CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
                                    CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COMMENT = '角色权限关联表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of role_permission
-- ----------------------------
INSERT INTO `role_permission` VALUES (1, 4);
INSERT INTO `role_permission` VALUES (2, 4);
INSERT INTO `role_permission` VALUES (1, 5);
INSERT INTO `role_permission` VALUES (4, 5);
INSERT INTO `role_permission` VALUES (1, 9);
INSERT INTO `role_permission` VALUES (4, 9);
INSERT INTO `role_permission` VALUES (1, 13);
INSERT INTO `role_permission` VALUES (2, 13);
INSERT INTO `role_permission` VALUES (3, 13);
INSERT INTO `role_permission` VALUES (5, 16);
INSERT INTO `role_permission` VALUES (1, 17);
INSERT INTO `role_permission` VALUES (4, 17);
INSERT INTO `role_permission` VALUES (5, 17);
INSERT INTO `role_permission` VALUES (1, 18);
INSERT INTO `role_permission` VALUES (3, 18);
INSERT INTO `role_permission` VALUES (1, 23);
INSERT INTO `role_permission` VALUES (1, 32);
INSERT INTO `role_permission` VALUES (4, 32);
INSERT INTO `role_permission` VALUES (1, 33);
INSERT INTO `role_permission` VALUES (2, 33);
INSERT INTO `role_permission` VALUES (1, 34);
INSERT INTO `role_permission` VALUES (2, 34);
INSERT INTO `role_permission` VALUES (1, 35);
INSERT INTO `role_permission` VALUES (2, 35);
INSERT INTO `role_permission` VALUES (1, 36);
INSERT INTO `role_permission` VALUES (1, 37);
INSERT INTO `role_permission` VALUES (1, 38);
INSERT INTO `role_permission` VALUES (1, 39);
INSERT INTO `role_permission` VALUES (2, 39);
INSERT INTO `role_permission` VALUES (1, 40);
INSERT INTO `role_permission` VALUES (2, 40);
INSERT INTO `role_permission` VALUES (1, 41);
INSERT INTO `role_permission` VALUES (2, 41);
INSERT INTO `role_permission` VALUES (1, 42);
INSERT INTO `role_permission` VALUES (1, 43);
INSERT INTO `role_permission` VALUES (2, 43);
INSERT INTO `role_permission` VALUES (3, 43);
INSERT INTO `role_permission` VALUES (4, 43);
INSERT INTO `role_permission` VALUES (1, 44);
INSERT INTO `role_permission` VALUES (1, 45);
INSERT INTO `role_permission` VALUES (2, 45);
INSERT INTO `role_permission` VALUES (1, 46);
INSERT INTO `role_permission` VALUES (4, 46);
INSERT INTO `role_permission` VALUES (1, 47);
INSERT INTO `role_permission` VALUES (3, 47);
INSERT INTO `role_permission` VALUES (1, 48);
INSERT INTO `role_permission` VALUES (2, 48);
INSERT INTO `role_permission` VALUES (3, 48);
INSERT INTO `role_permission` VALUES (1, 49);
INSERT INTO `role_permission` VALUES (2, 49);
INSERT INTO `role_permission` VALUES (1, 50);
INSERT INTO `role_permission` VALUES (2, 50);
INSERT INTO `role_permission` VALUES (1, 51);
INSERT INTO `role_permission` VALUES (2, 51);
INSERT INTO `role_permission` VALUES (1, 52);
INSERT INTO `role_permission` VALUES (2, 52);
INSERT INTO `role_permission` VALUES (1, 53);
INSERT INTO `role_permission` VALUES (4, 53);
INSERT INTO `role_permission` VALUES (1, 54);
INSERT INTO `role_permission` VALUES (2, 54);
INSERT INTO `role_permission` VALUES (1, 55);
INSERT INTO `role_permission` VALUES (2, 55);
INSERT INTO `role_permission` VALUES (1, 56);
INSERT INTO `role_permission` VALUES (1, 57);
INSERT INTO `role_permission` VALUES (2, 57);
INSERT INTO `role_permission` VALUES (1, 58);
INSERT INTO `role_permission` VALUES (2, 58);
INSERT INTO `role_permission` VALUES (1, 59);

-- 创建user_role表
DROP TABLE IF EXISTS `user_role`;
CREATE TABLE `user_role` (
                             `user_id` int NOT NULL COMMENT '用户 ID',
                             `role_id` int NOT NULL COMMENT '角色 ID',
                             PRIMARY KEY (`user_id`, `role_id`) USING BTREE,
                             INDEX `idx_role_id`(`role_id` ASC) USING BTREE,
                             CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
                             CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `user_information` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COMMENT = '用户角色关联表' ROW_FORMAT = DYNAMIC;

-- 备份用户表
CREATE TABLE IF NOT EXISTS `user_information_backup` AS
SELECT * FROM `user_information`;

-- 清空user_role
TRUNCATE TABLE `user_role`;

-- 通过 code 映射到新 role.id
INSERT INTO `user_role` (`user_id`, `role_id`)
SELECT
    ui.id AS user_id,
    r_new.id AS role_id
FROM `user_information` ui
         JOIN temp_old_role_mapping old_map ON ui.role_id = old_map.old_role_id
         JOIN `role` r_new ON old_map.code = r_new.code
WHERE ui.role_id IS NOT NULL AND ui.role_id > 0;

-- 统计信息
SELECT
    '迁移完成统计' AS info,
    (SELECT COUNT(*) FROM `user_information`) AS total_users,
    (SELECT COUNT(*) FROM `user_role`) AS user_role_mappings;

-- 数据验证
SELECT
    '数据验证' AS verification,
    COUNT(DISTINCT ui.id) AS users_with_roles,
    COUNT(DISTINCT ur.user_id) AS mapped_users
FROM `user_information` ui
         LEFT JOIN `user_role` ur ON ui.id = ur.user_id
WHERE ui.role_id IS NOT NULL;

-- 删除 user_information 中的 role_id 字段
ALTER TABLE `user_information` DROP FOREIGN KEY `fk_user_role`;
ALTER TABLE `user_information` DROP INDEX `idx_role_id`;
ALTER TABLE `user_information` DROP COLUMN `role_id`;

-- 更新 site_config 表中的 register_user_permission 字段，映射到新角色 id
UPDATE `site_config` sc
JOIN temp_old_role_mapping old_map ON sc.register_user_permission = old_map.old_role_id
JOIN `role` r_new ON old_map.code = r_new.code
SET sc.register_user_permission = r_new.id
WHERE sc.register_user_permission IS NOT NULL;

-- 最终状态
SELECT
    '迁移后状态' AS final_status,
    (SELECT COUNT(*) FROM `user_information`) AS total_users,
    (SELECT COUNT(*) FROM `user_role`) AS total_role_mappings,
    (SELECT COUNT(*) FROM `role`) AS total_roles,
    (SELECT COUNT(*) FROM `permission`) AS total_permissions,
    (SELECT COUNT(*) FROM `role_permission`) AS total_role_permission_mappings;

DROP TABLE IF EXISTS `user_information_backup`;
-- 启用外键检查
SET FOREIGN_KEY_CHECKS = 1;