/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80405 (8.4.5)
 Source Host           : localhost:3306
 Source Schema         : dim_stack

 Target Server Type    : MySQL
 Target Server Version : 80405 (8.4.5)
 File Encoding         : 65001

 Date: 11/09/2025 16:41:19
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for article
-- ----------------------------
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article`  (
                            `id` int NOT NULL AUTO_INCREMENT COMMENT '创建顺序',
                            `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户uuid',
                            `article_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文章id（唯一）',
                            `article_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文章名字',
                            `article_cover` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '文章封面',
                            `excerpt` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '文章摘要',
                            `article_content` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文章正文',
                            `page_views` bigint NOT NULL DEFAULT 0 COMMENT '文章阅读量',
                            `like_count` bigint NOT NULL DEFAULT 0 COMMENT '文章点赞数',
                            `favorite_count` bigint NOT NULL DEFAULT 0 COMMENT '文章收藏数',
                            `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '文章阅读密码',
                            `tag` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文章标签',
                            `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文章分类',
                            `alias` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文章访问链接',
                            `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '文章上传时间',
                            `status` tinyint NOT NULL COMMENT '文章状态：0=删除, 1=正常, 2=未发布, 3=待审核，4违规',
                            PRIMARY KEY (`id`) USING BTREE,
                            UNIQUE INDEX `article_id`(`article_id` ASC) USING BTREE,
                            UNIQUE INDEX `alias`(`alias` ASC) USING BTREE,
                            INDEX `user_article_uuid`(`uuid` ASC) USING BTREE,
                            INDEX `tag`(`tag` ASC) USING BTREE,
                            INDEX `categories`(`category` ASC) USING BTREE,
                            CONSTRAINT `categories` FOREIGN KEY (`category`) REFERENCES `article_categories` (`article_categories`) ON DELETE RESTRICT ON UPDATE RESTRICT,
                            CONSTRAINT `fk_article_user` FOREIGN KEY (`uuid`) REFERENCES `user_information` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE,
                            CONSTRAINT `tag` FOREIGN KEY (`tag`) REFERENCES `article_tag` (`tag_name`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '文章上传记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of article
-- ----------------------------

-- ----------------------------
-- Table structure for article_categories
-- ----------------------------
DROP TABLE IF EXISTS `article_categories`;
CREATE TABLE `article_categories`  (
                                       `id` int NOT NULL AUTO_INCREMENT,
                                       `article_categories` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '分类名称',
                                       `categories_explain` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '分类说明',
                                       `founder` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '创建人',
                                       `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
                                       `status` int NOT NULL COMMENT '分类状态：0=未启用, 1=启用',
                                       PRIMARY KEY (`id`) USING BTREE,
                                       UNIQUE INDEX `article_categories`(`article_categories` ASC) USING BTREE,
                                       INDEX `categories_founder`(`founder` ASC) USING BTREE,
                                       CONSTRAINT `categories_founder` FOREIGN KEY (`founder`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE SET NULL
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of article_categories
-- ----------------------------
INSERT INTO `article_categories` VALUES (1, '默认分类', '默认分类', '075eb86f721743e3940f35869154a140175689381296899805858', '2025-09-03 18:05:44', 1);

-- ----------------------------
-- Table structure for article_tag
-- ----------------------------
DROP TABLE IF EXISTS `article_tag`;
CREATE TABLE `article_tag`  (
                                `id` int NOT NULL AUTO_INCREMENT,
                                `tag_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '标签名称',
                                `tag_explain` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '标签说明',
                                `founder` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '创建此标签的用户',
                                `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
                                `status` int NOT NULL COMMENT '标签状态：0=未启用, 1=启用',
                                PRIMARY KEY (`id`) USING BTREE,
                                UNIQUE INDEX `tag_name`(`tag_name` ASC) USING BTREE,
                                INDEX `tag_founder`(`founder` ASC) USING BTREE,
                                CONSTRAINT `tag_founder` FOREIGN KEY (`founder`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of article_tag
-- ----------------------------
INSERT INTO `article_tag` VALUES (1, '默认标签', '默认标签', '075eb86f721743e3940f35869154a140175689381296899805858', '2025-09-03 18:05:11', 1);

-- ----------------------------
-- Table structure for attachment
-- ----------------------------
DROP TABLE IF EXISTS `attachment`;
CREATE TABLE `attachment`  (
                               `id` int NOT NULL AUTO_INCREMENT COMMENT '上传顺序',
                               `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户唯一id',
                               `attachment_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '附件唯一id',
                               `attachment_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '附件路径',
                               `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '上传时间',
                               `status` tinyint NOT NULL COMMENT '附件状态：0=删除, 1=正常',
                               PRIMARY KEY (`id`) USING BTREE,
                               UNIQUE INDEX `attachment_id`(`attachment_id` ASC) USING BTREE,
                               UNIQUE INDEX `attachment_path`(`attachment_path` ASC) USING BTREE,
                               INDEX `idx_uuid`(`uuid` ASC) USING BTREE,
                               CONSTRAINT `fk_attachment_user` FOREIGN KEY (`uuid`) REFERENCES `user_information` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '附件上传记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of attachment
-- ----------------------------

-- ----------------------------
-- Table structure for comment
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment`  (
                            `id` int NOT NULL AUTO_INCREMENT,
                            `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '评论用户id',
                            `comment_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '评论id',
                            `article_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '所属文章id',
                            `root_comment_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '如果为空则为顶级评论，如果不为空则为顶级评论的id',
                            `to_comment_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '如果为null则为顶级评论,否则为目标评论id',
                            `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评论创建时间',
                            `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
                            `content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '内容',
                            `comment_like_count` bigint NOT NULL COMMENT '点赞数',
                            `status` int NOT NULL COMMENT '0为删除，1为正常',
                            PRIMARY KEY (`id`) USING BTREE,
                            UNIQUE INDEX `comment_id`(`comment_id` ASC) USING BTREE,
                            INDEX `comment_article_id`(`article_id` ASC) USING BTREE,
                            INDEX `comment_user_id`(`user_id` ASC) USING BTREE,
                            CONSTRAINT `comment_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON DELETE CASCADE ON UPDATE CASCADE,
                            CONSTRAINT `comment_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_information` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of comment
-- ----------------------------

-- ----------------------------
-- Table structure for menus
-- ----------------------------
DROP TABLE IF EXISTS `menus`;
CREATE TABLE `menus`  (
                          `id` int NOT NULL AUTO_INCREMENT,
                          `menus_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '目录id',
                          `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '创建该目录的用户',
                          `menus_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '目录名称',
                          `menus_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '目录url',
                          `status` int NOT NULL COMMENT '0为删除、1为正常',
                          PRIMARY KEY (`id`) USING BTREE,
                          UNIQUE INDEX `menus_id`(`menus_id` ASC) USING BTREE,
                          INDEX `menus_user_id`(`user_id` ASC) USING BTREE,
                          CONSTRAINT `menus_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE SET NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of menus
-- ----------------------------

-- ----------------------------
-- Table structure for permission
-- ----------------------------
DROP TABLE IF EXISTS `permission`;
CREATE TABLE `permission`  (
                               `id` int NOT NULL AUTO_INCREMENT COMMENT '权限ID',
                               `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '权限码，如 post:view',
                               `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '权限名称，如 查看文章',
                               `module` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '所属模块，如 post, user, system',
                               `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                               PRIMARY KEY (`id`) USING BTREE,
                               UNIQUE INDEX `idx_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '权限表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of permission
-- ----------------------------
INSERT INTO `permission` VALUES (1, 'post:view', '查看文章', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (2, 'post:create', '创建文章', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (3, 'post:edit:own', '编辑自己的文章', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (4, 'post:delete:own', '删除自己的文章', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (5, 'post:submit', '提交文章发布', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (6, 'post:edit:any', '编辑所有文章', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (7, 'post:delete:any', '删除任何文章', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (8, 'post:publish', '发布文章', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (9, 'post:review', '审核文章', 'post', '2025-08-27 09:22:27');
INSERT INTO `permission` VALUES (10, 'system:edit', '系统编辑', 'system', '2025-09-11 15:16:33');
INSERT INTO `permission` VALUES (11, 'user:management', '用户管理', 'user', '2025-09-11 16:03:13');

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role`  (
                         `id` int NOT NULL AUTO_INCREMENT,
                         `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '角色编码，如 AUTHOR',
                         `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '角色名称，如 作者',
                         `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '描述',
                         `status` tinyint NULL DEFAULT 1 COMMENT '状态：1启用，0禁用',
                         PRIMARY KEY (`id`) USING BTREE,
                         UNIQUE INDEX `idx_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '角色表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of role
-- ----------------------------
INSERT INTO `role` VALUES (1, 'READER', '阅读者', '未注册用户，可以浏览和阅读已发布的文章内容，参与评论互动，但无法创建或编辑文章。', 1);
INSERT INTO `role` VALUES (2, 'AUTHOR', '作者', '内容创作者角色，可以创建、编辑、删除自己的文章，并提交文章进入审核流程，等待管理员发布。', 1);
INSERT INTO `role` VALUES (3, 'POST_MANAGER', '文章管理员', '负责内容运营管理的角色，可以审核、发布、修改和删除任何文章，管理评论，维护内容质量和平台秩序。', 1);
INSERT INTO `role` VALUES (4, 'ADMIN', '管理员', '系统超级管理员，拥有最高权限，可管理用户、角色、权限、站点配置等所有功能，负责平台整体运行与安全。', 1);

-- ----------------------------
-- Table structure for role_permission
-- ----------------------------
DROP TABLE IF EXISTS `role_permission`;
CREATE TABLE `role_permission`  (
                                    `role_id` int NOT NULL COMMENT '角色ID',
                                    `permission_id` int NOT NULL COMMENT '权限ID',
                                    PRIMARY KEY (`role_id`, `permission_id`) USING BTREE,
                                    INDEX `idx_permission_id`(`permission_id` ASC) USING BTREE,
                                    CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
                                    CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '角色权限关联表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of role_permission
-- ----------------------------
INSERT INTO `role_permission` VALUES (1, 1);
INSERT INTO `role_permission` VALUES (2, 1);
INSERT INTO `role_permission` VALUES (3, 1);
INSERT INTO `role_permission` VALUES (4, 1);
INSERT INTO `role_permission` VALUES (2, 2);
INSERT INTO `role_permission` VALUES (3, 2);
INSERT INTO `role_permission` VALUES (4, 2);
INSERT INTO `role_permission` VALUES (2, 3);
INSERT INTO `role_permission` VALUES (3, 3);
INSERT INTO `role_permission` VALUES (4, 3);
INSERT INTO `role_permission` VALUES (2, 4);
INSERT INTO `role_permission` VALUES (3, 4);
INSERT INTO `role_permission` VALUES (4, 4);
INSERT INTO `role_permission` VALUES (2, 5);
INSERT INTO `role_permission` VALUES (3, 5);
INSERT INTO `role_permission` VALUES (4, 5);
INSERT INTO `role_permission` VALUES (3, 6);
INSERT INTO `role_permission` VALUES (4, 6);
INSERT INTO `role_permission` VALUES (3, 7);
INSERT INTO `role_permission` VALUES (4, 7);
INSERT INTO `role_permission` VALUES (3, 8);
INSERT INTO `role_permission` VALUES (4, 8);
INSERT INTO `role_permission` VALUES (3, 9);
INSERT INTO `role_permission` VALUES (4, 9);
INSERT INTO `role_permission` VALUES (4, 10);
INSERT INTO `role_permission` VALUES (4, 11);

-- ----------------------------
-- Table structure for site_config
-- ----------------------------
DROP TABLE IF EXISTS `site_config`;
CREATE TABLE `site_config`  (
                                `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
                                `site_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '站点名称',
                                `register_user_permission` int NULL DEFAULT NULL COMMENT '注册用户默认角色id',
                                `copyright` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '版权信息',
                                `article_status` int NOT NULL COMMENT '用户上传文章默认状态0为不发布1为发布',
                                `hero_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '首页头图',
                                `hero_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '首页标题',
                                `hero_subtitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '首页副标题',
                                PRIMARY KEY (`id`) USING BTREE,
                                INDEX `register_user_permission`(`register_user_permission` ASC) USING BTREE,
                                CONSTRAINT `register_user_permission` FOREIGN KEY (`register_user_permission`) REFERENCES `role` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '站点基础设置表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of site_config
-- ----------------------------
INSERT INTO `site_config` VALUES (1, '次元栈 - Dim Stack', 2, '© 2025 次元栈 - Dim Stack. All rights reserved.', 3, 'https://lingview.xyz/upload/a2c28b53fdc12fde51bf23928127066f.jpg', '欢迎来到瓦纳海姆星', '探索洛天依和Vsinger家族的音乐之旅');

-- ----------------------------
-- Table structure for user_information
-- ----------------------------
DROP TABLE IF EXISTS `user_information`;
CREATE TABLE `user_information`  (
                                     `id` int NOT NULL AUTO_INCREMENT COMMENT '用户创建顺序',
                                     `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '唯一用户id',
                                     `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
                                     `avatar` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '用户头像',
                                     `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '手机号',
                                     `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '邮箱',
                                     `gender` enum('male','female','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '性别',
                                     `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码',
                                     `birthday` date NULL DEFAULT NULL COMMENT '生日',
                                     `role_id` int NOT NULL DEFAULT 2 COMMENT '角色ID，外键引用 role.id',
                                     `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '用户创建时间',
                                     `status` tinyint NOT NULL COMMENT '用户状态：0=删除, 1=正常, 2=封禁',
                                     PRIMARY KEY (`id`) USING BTREE,
                                     UNIQUE INDEX `uuid`(`uuid` ASC) USING BTREE,
                                     INDEX `idx_role_id`(`role_id` ASC) USING BTREE,
                                     CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_information
-- ----------------------------
INSERT INTO `user_information` VALUES (1, '075eb86f721743e3940f35869154a140175689381296899805858', 'admin', '/upload/admin/avatar/avatar-3e04e348-8bef-4abe-a164-572e0421f17e-1757579183.jpeg', NULL, 'official@dimstack.com', NULL, '$2a$10$hNfMxBf3egQkomuMql9LDeMJb2AC9IXkp904GgqX6DAxc8u9i1aAm', NULL, 4, '2025-09-03 18:03:33', 1);

SET FOREIGN_KEY_CHECKS = 1;
