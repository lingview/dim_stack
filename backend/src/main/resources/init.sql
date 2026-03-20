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

 Date: 19/03/2026 23:55:16
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for article
-- ----------------------------
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article`  (
                            `id` int NOT NULL AUTO_INCREMENT COMMENT '创建顺序',
                            `uuid` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '用户uuid',
                            `article_id` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '文章id（唯一）',
                            `article_name` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '文章名字',
                            `article_cover` text CHARACTER SET utf8mb4 NULL COMMENT '文章封面',
                            `excerpt` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '文章摘要',
                            `article_content` mediumtext CHARACTER SET utf8mb4 NOT NULL COMMENT '文章正文',
                            `page_views` bigint NOT NULL DEFAULT 0 COMMENT '文章阅读量',
                            `like_count` bigint NOT NULL DEFAULT 0 COMMENT '文章点赞数',
                            `favorite_count` bigint NOT NULL DEFAULT 0 COMMENT '文章收藏数',
                            `password` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '文章阅读密码',
                            `category_id` int NOT NULL,
                            `alias` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '文章访问链接',
                            `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '文章创建时间',
                            `status` tinyint NOT NULL COMMENT '文章状态：0=删除, 1=正常, 2=未发布, 3=待审核，4违规',
                            PRIMARY KEY (`id`) USING BTREE,
                            UNIQUE INDEX `article_id`(`article_id` ASC) USING BTREE,
                            UNIQUE INDEX `alias`(`alias` ASC) USING BTREE,
                            INDEX `user_article_uuid`(`uuid` ASC) USING BTREE,
                            INDEX `idx_article_status_ctime`(`status` ASC, `create_time` DESC) USING BTREE,
                            INDEX `idx_article_status_category_ctime`(`status` ASC, `create_time` DESC) USING BTREE,
                            INDEX `idx_article_status_category_pageviews`(`status` ASC, `page_views` DESC) USING BTREE,
                            INDEX `fk_article_category_id`(`category_id` ASC) USING BTREE,
                            FULLTEXT INDEX `idx_fulltext_cn`(`article_name`, `excerpt`) WITH PARSER `ngram`,
                            FULLTEXT INDEX `idx_fulltext_en`(`article_name`, `excerpt`),
                            CONSTRAINT `fk_article_category_id` FOREIGN KEY (`category_id`) REFERENCES `article_categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
                            CONSTRAINT `fk_article_user` FOREIGN KEY (`uuid`) REFERENCES `user_information` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COMMENT = '文章上传记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of article
-- ----------------------------
INSERT INTO `article` VALUES (1, '075eb86f721743e3940f35869154a140175689381296899805858', 'a1d3112d-fd8e-4484-9c3c-bad24a9e2019', '关于', 'https://pan.lingview.xyz/d/%E9%9B%A8%E4%BA%91%E8%8A%82%E7%82%B9/%E5%9B%BE%E5%BA%93/%E5%A4%A9%E4%BE%9D/Image_2756849649102.jpg?sign=nkverrmGB28h2DgiXlGIZBlzD2WMVByK7hNn9zwAJI4=:0', '关于本项目', '# 关于次元栈\n## 🌟 项目简介\n**次元栈** 基于SpringBoot的的现代化博客系统\n\n平台核心功能：\n\n+ 📝 文章发布与内容管理（CMS）\n+ 💬 用户互动：评论、点赞、收藏\n+ 🔖 标签分类：支持跨圈层内容组织\n+ 👥 用户系统：注册、登录、个人主页、权限管理、文章发布管理系统......\n+ 🔍 内容搜索与推荐\n+ 📱 响应式前端，支持移动端浏览\n......\n---\n\n## 🛠 技术栈\n\n| 层级       | 技术选型                                                         |\n|------------|--------------------------------------------------------------|\n| **后端**   | Java 17+, Spring Boot 4, Mybatis, MySQL, Redis, Cookie      |\n| **前端**   | React 19, JavaScript, Vite, Axios, Tailwind CSS              |\n| **构建**   | Maven (后端), npm/pnpm (前端)                                    |\n| **部署**   | Docker, Nginx, Linux, Windows                                |\n---\n\n', 0, 0, 0, '', 1, 'about', '2025-09-13 12:42:47', 1);
INSERT INTO `article` VALUES (2, '075eb86f721743e3940f35869154a140175689381296899805858', '3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1', '致谢', 'https://pan.lingview.xyz/d/%E9%9B%A8%E4%BA%91%E8%8A%82%E7%82%B9/%E5%9B%BE%E5%BA%93/%E5%A4%A9%E4%BE%9D/e5f2f1fe4bfceeb32e88217577732c04.jpg?sign=IA5DnGzWtBhEhYM5e9je4Xx3CqZOMngUd_D4TdLt2X4=:0', '感谢对本项目提供帮助的个人、组织与项目', '# 致谢\n\n在此，我们衷心感谢以下为本项目提供帮助、支持或灵感的个人和组织：\n\n## 贡献者\n感谢所有参与本项目的贡献者（按字母顺序排列）：\n- [@bytegeek](https://github.com/xrb114) - 渗透测试\n- [@Denghls](https://github.com/Denghls) - 需求分析\n- [@hanbingniao](https://github.com/hanbingniao) - 系统测试\n- [@kongcangyimama](https://github.com/kongcangyimama) - 主题设计\n- [@lingview](https://github.com/lingview) - 系统开发\n- [@q1uf3ng](https://github.com/q1uf3ng) - 渗透测试\n- [@YeFeng0712](https://github.com/YeFeng0712) - 需求分析\n- [@yukifia](https://github.com/yukifia) - 需求分析\n\n---\n\n## 💡 特别感谢\n- 感谢所有为本项目贡献代码、提出问题和提供反馈的开发者。  \n- 感谢开源社区持续的支持与贡献。  \n\n---\n\n注：如果你在本项目中做出了贡献，请提交 PR 将你的名字加入到致谢名单中！  \n', 0, 0, 0, '', 1, 'thanks', '2025-09-14 11:26:52', 1);

-- ----------------------------
-- Table structure for article_categories
-- ----------------------------
DROP TABLE IF EXISTS `article_categories`;
CREATE TABLE `article_categories`  (
                                       `id` int NOT NULL AUTO_INCREMENT,
                                       `parent_id` int NULL DEFAULT NULL COMMENT '父分类ID，NULL 表示顶级分类',
                                       `article_categories` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '分类名称',
                                       `categories_explain` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '分类说明',
                                       `founder` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '创建人',
                                       `article_count` int NOT NULL DEFAULT 0 COMMENT '文章数量',
                                       `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
                                       `status` int NOT NULL COMMENT '分类状态：0=禁用, 1=启用',
                                       PRIMARY KEY (`id`) USING BTREE,
                                       UNIQUE INDEX `uk_category_name_parent`(`article_categories` ASC, `parent_id` ASC) USING BTREE,
                                       INDEX `idx_parent_id`(`parent_id` ASC) USING BTREE,
                                       INDEX `categories_founder`(`founder` ASC) USING BTREE,
                                       CONSTRAINT `categories_founder_new` FOREIGN KEY (`founder`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE SET NULL,
                                       CONSTRAINT `fk_parent_category` FOREIGN KEY (`parent_id`) REFERENCES `article_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of article_categories
-- ----------------------------
INSERT INTO `article_categories` VALUES (1, NULL, '默认分类', '默认分类', '075eb86f721743e3940f35869154a140175689381296899805858', 2, '2025-09-13 13:35:57', 1);
INSERT INTO `article_categories` VALUES (2, NULL, '接口文档', '接口文档', '075eb86f721743e3940f35869154a140175689381296899805858', 0, '2026-01-31 11:35:39', 0);

-- ----------------------------
-- Table structure for article_like
-- ----------------------------
DROP TABLE IF EXISTS `article_like`;
CREATE TABLE `article_like`  (
                                 `id` int NOT NULL AUTO_INCREMENT,
                                 `article_id` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
                                 `user_id` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL,
                                 `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 PRIMARY KEY (`id`) USING BTREE,
                                 INDEX `fk_like_article`(`article_id` ASC) USING BTREE,
                                 INDEX `fk_user_id`(`user_id` ASC) USING BTREE,
                                 CONSTRAINT `fk_like_article` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                 CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of article_like
-- ----------------------------

-- ----------------------------
-- Table structure for article_tag
-- ----------------------------
DROP TABLE IF EXISTS `article_tag`;
CREATE TABLE `article_tag`  (
                                `id` int NOT NULL AUTO_INCREMENT,
                                `tag_name` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '标签名称',
                                `tag_explain` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '标签说明',
                                `founder` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '创建此标签的用户',
                                `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
                                `status` int NOT NULL COMMENT '标签状态：0=禁用, 1=启用',
                                PRIMARY KEY (`id`) USING BTREE,
                                UNIQUE INDEX `tag_name`(`tag_name` ASC) USING BTREE,
                                INDEX `tag_founder`(`founder` ASC) USING BTREE,
                                CONSTRAINT `tag_founder` FOREIGN KEY (`founder`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of article_tag
-- ----------------------------
INSERT INTO `article_tag` VALUES (1, '默认标签', '默认标签', '075eb86f721743e3940f35869154a140175689381296899805858', '2025-09-13 13:33:24', 1);
INSERT INTO `article_tag` VALUES (2, '接口文档', '接口文档', '075eb86f721743e3940f35869154a140175689381296899805858', '2026-01-31 11:36:15', 0);

-- ----------------------------
-- Table structure for article_tag_relation
-- ----------------------------
DROP TABLE IF EXISTS `article_tag_relation`;
CREATE TABLE `article_tag_relation`  (
                                         `article_id` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '文章id',
                                         `article_tag` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '文章标签',
                                         INDEX `article_id`(`article_id` ASC) USING BTREE,
                                         INDEX `article_tag`(`article_tag` ASC) USING BTREE,
                                         CONSTRAINT `article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                         CONSTRAINT `article_tag` FOREIGN KEY (`article_tag`) REFERENCES `article_tag` (`tag_name`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of article_tag_relation
-- ----------------------------
INSERT INTO `article_tag_relation` VALUES ('52bffedc-5f09-48f4-a6cf-06a906bc73f4', '默认标签');
INSERT INTO `article_tag_relation` VALUES ('52bffedc-5f09-48f4-a6cf-06a906bc73f4', '接口文档');
INSERT INTO `article_tag_relation` VALUES ('3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1', '默认标签');
INSERT INTO `article_tag_relation` VALUES ('a1d3112d-fd8e-4484-9c3c-bad24a9e2019', '默认标签');

-- ----------------------------
-- Table structure for attachment
-- ----------------------------
DROP TABLE IF EXISTS `attachment`;
CREATE TABLE `attachment`  (
                               `id` int NOT NULL AUTO_INCREMENT COMMENT '上传顺序',
                               `uuid` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '用户唯一id',
                               `attachment_id` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '附件唯一id',
                               `original_filename` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '原始文件名',
                               `attachment_path` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '附件路径',
                               `access_key` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '文件访问键',
                               `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
                               `deleted_time` datetime NULL DEFAULT NULL COMMENT '删除时间',
                               `status` tinyint NOT NULL COMMENT '附件状态：0=软删除, 1=正常, 2=物理文件已删除',
                               PRIMARY KEY (`id`) USING BTREE,
                               UNIQUE INDEX `attachment_id`(`attachment_id` ASC) USING BTREE,
                               UNIQUE INDEX `attachment_path`(`attachment_path` ASC) USING BTREE,
                               UNIQUE INDEX `access_key`(`access_key` ASC) USING BTREE,
                               INDEX `idx_uuid`(`uuid` ASC) USING BTREE,
                               CONSTRAINT `fk_attachment_user` FOREIGN KEY (`uuid`) REFERENCES `user_information` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COMMENT = '附件上传记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of attachment
-- ----------------------------

-- ----------------------------
-- Table structure for comment
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment`  (
                            `id` int NOT NULL AUTO_INCREMENT,
                            `user_id` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '评论用户id',
                            `comment_id` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '评论id',
                            `article_id` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '所属文章id',
                            `root_comment_id` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '如果为空则为顶级评论，如果不为空则为顶级评论的id',
                            `to_comment_id` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '如果为null则为顶级评论,否则为目标评论id',
                            `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评论创建时间',
                            `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
                            `content` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '内容',
                            `comment_like_count` bigint NOT NULL COMMENT '点赞数',
                            `status` int NOT NULL COMMENT '0为删除，1为正常',
                            PRIMARY KEY (`id`) USING BTREE,
                            UNIQUE INDEX `comment_id`(`comment_id` ASC) USING BTREE,
                            INDEX `comment_article_id`(`article_id` ASC) USING BTREE,
                            INDEX `comment_user_id`(`user_id` ASC) USING BTREE,
                            CONSTRAINT `comment_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON DELETE CASCADE ON UPDATE CASCADE,
                            CONSTRAINT `comment_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_information` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of comment
-- ----------------------------

-- ----------------------------
-- Table structure for comment_like
-- ----------------------------
DROP TABLE IF EXISTS `comment_like`;
CREATE TABLE `comment_like`  (
                                 `id` int NOT NULL AUTO_INCREMENT,
                                 `user_id` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '点赞用户ID',
                                 `comment_id` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '被点赞的评论ID',
                                 `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
                                 PRIMARY KEY (`id`) USING BTREE,
                                 UNIQUE INDEX `uk_user_comment`(`user_id` ASC, `comment_id` ASC) USING BTREE,
                                 INDEX `fk_like_comment`(`comment_id` ASC) USING BTREE,
                                 CONSTRAINT `fk_like_comment` FOREIGN KEY (`comment_id`) REFERENCES `comment` (`comment_id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                 CONSTRAINT `fk_like_user` FOREIGN KEY (`user_id`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COMMENT = '评论点赞记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of comment_like
-- ----------------------------

-- ----------------------------
-- Table structure for custom_page
-- ----------------------------
DROP TABLE IF EXISTS `custom_page`;
CREATE TABLE `custom_page`  (
                                `id` int NOT NULL AUTO_INCREMENT,
                                `uuid` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL,
                                `page_name` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '页面名',
                                `page_code` mediumtext CHARACTER SET utf8mb4 NOT NULL COMMENT '页面代码',
                                `alias` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '访问地址',
                                `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '页面创建时间',
                                `status` int NOT NULL COMMENT '页面状态0为删除1为正常',
                                PRIMARY KEY (`id`) USING BTREE,
                                UNIQUE INDEX `alias`(`alias` ASC) USING BTREE COMMENT '页面访问地址',
                                INDEX `uuid`(`uuid` ASC) USING BTREE,
                                CONSTRAINT `fk_custom_page_user_uuid` FOREIGN KEY (`uuid`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of custom_page
-- ----------------------------

-- ----------------------------
-- Table structure for dashboard_menu
-- ----------------------------
DROP TABLE IF EXISTS `dashboard_menu`;
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
-- ----------------------------
-- Table structure for friend_links
-- ----------------------------
DROP TABLE IF EXISTS `friend_links`;
CREATE TABLE `friend_links`  (
                                 `id` int NOT NULL AUTO_INCREMENT,
                                 `uuid` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '唯一id',
                                 `site_name` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '站点名称',
                                 `site_url` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '站点url',
                                 `site_icon` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '站点图标url',
                                 `site_description` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '站点介绍',
                                 `webmaster_name` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '站长名称',
                                 `contact` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '联系方式',
                                 `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                 `status` int NOT NULL COMMENT '0为删除，1为通过审核，2为待审核',
                                 PRIMARY KEY (`id`) USING BTREE,
                                 UNIQUE INDEX `uuid`(`uuid` ASC) USING BTREE,
                                 UNIQUE INDEX `site_url`(`site_url` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of friend_links
-- ----------------------------

-- ----------------------------
-- Table structure for menus
-- ----------------------------
DROP TABLE IF EXISTS `menus`;
CREATE TABLE `menus`  (
                          `id` int NOT NULL AUTO_INCREMENT,
                          `menus_id` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '目录id',
                          `user_id` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '创建该目录的用户',
                          `menus_name` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '目录名称',
                          `menus_url` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '目录url',
                          `sort_order` int NOT NULL COMMENT '菜单的显示顺序',
                          `status` int NOT NULL COMMENT '0为删除、1为正常',
                          PRIMARY KEY (`id`) USING BTREE,
                          UNIQUE INDEX `menus_id`(`menus_id` ASC) USING BTREE,
                          INDEX `menus_user_id`(`user_id` ASC) USING BTREE,
                          CONSTRAINT `menus_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE SET NULL
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of menus
-- ----------------------------
INSERT INTO `menus` VALUES (1, 'menu_f7f08e6b511848c680c98749cc89b073', '075eb86f721743e3940f35869154a140175689381296899805858', '首页', '/', 0, 1);
INSERT INTO `menus` VALUES (2, 'menu_096205a759934193952aef85dfe382fa', '075eb86f721743e3940f35869154a140175689381296899805858', '作者主页', 'https://github.com/lingview', 1, 0);
INSERT INTO `menus` VALUES (3, 'menu_d7f2c129f1df45c4a606bcd69cf02b51', '075eb86f721743e3940f35869154a140175689381296899805858', '项目地址', 'https://github.com/lingview/dim_stack', 2, 1);
INSERT INTO `menus` VALUES (4, 'menu_16404a4412c0463f9d04e5dea10c19bc', '075eb86f721743e3940f35869154a140175689381296899805858', '致谢', '/article/thanks', 3, 1);
INSERT INTO `menus` VALUES (5, 'menu_8d1022c01adf4b8f87bc9debd86f33a5', '075eb86f721743e3940f35869154a140175689381296899805858', '友链', '/friend-links', 4, 1);
INSERT INTO `menus` VALUES (6, 'menu_f71584ff8f574978bf0e66e52bccf2ac', '075eb86f721743e3940f35869154a140175689381296899805858', '关于', '/article/about', 5, 1);

-- ----------------------------
-- Table structure for music
-- ----------------------------
DROP TABLE IF EXISTS `music`;
CREATE TABLE `music`  (
                          `id` int NOT NULL AUTO_INCREMENT,
                          `uuid` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '上传用户uuid',
                          `music_name` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '曲名',
                          `music_author` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '曲作者',
                          `music_url` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '文件地址',
                          `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                          `status` int NOT NULL COMMENT '0为删除1为正常',
                          PRIMARY KEY (`id`) USING BTREE,
                          INDEX `fk_music_user_uuid`(`uuid` ASC) USING BTREE,
                          CONSTRAINT `fk_music_user_uuid` FOREIGN KEY (`uuid`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of music
-- ----------------------------

-- ----------------------------
-- Table structure for permission
-- ----------------------------
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

-- ----------------------------
-- Table structure for role
-- ----------------------------
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

-- ----------------------------
-- Records of role
-- ----------------------------
INSERT INTO `role` VALUES (1, 'ADMIN', '管理员', '系统超级管理员，拥有最高权限，可管理用户、角色、权限、站点配置等所有功能，负责平台整体运行与安全。', 1);
INSERT INTO `role` VALUES (2, 'OPERATOR ', '操作员', '负责平台运营，拥有部分系统配置权限', 1);
INSERT INTO `role` VALUES (3, 'POST_MANAGER', '文章管理员', '负责内容运营管理的角色，可以审核、发布、修改和删除任何文章，管理评论，维护内容质量和平台秩序。', 1);
INSERT INTO `role` VALUES (4, 'AUTHOR', '作者', '内容创作者角色，可以创建、编辑、删除自己的文章，并提交文章进入审核流程，等待管理员发布。', 1);
INSERT INTO `role` VALUES (5, 'READER', '阅读者', '可以浏览和阅读已发布的文章内容，参与评论互动，但无法创建或编辑文章。', 1);

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

-- ----------------------------
-- Table structure for site_config
-- ----------------------------
DROP TABLE IF EXISTS `site_config`;
CREATE TABLE `site_config`  (
                                `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
                                `site_name` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '站点名称',
                                `register_user_permission` int NULL DEFAULT NULL COMMENT '注册用户默认角色id',
                                `copyright` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '版权信息',
                                `article_status` int NOT NULL COMMENT '用户上传文章默认状态0为不发布1为发布',
                                `hero_image` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '首页头图',
                                `hero_title` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '首页标题',
                                `hero_subtitle` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '首页副标题',
                                `site_icon` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '站点图标',
                                `site_theme` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '站点主题',
                                `expansion_server` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '扩展服务器',
                                `enable_notification` tinyint(1) NULL DEFAULT 0 COMMENT '是否启用通知系统（1：启用，0：禁用）',
                                `smtp_host` varchar(100) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT 'SMTP服务器地址',
                                `smtp_port` int NULL DEFAULT NULL COMMENT 'SMTP端口',
                                `mail_sender_email` varchar(100) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '发件人邮箱',
                                `mail_sender_name` varchar(50) CHARACTER SET utf8mb4 NULL DEFAULT '系统通知' COMMENT '发件人名称',
                                `mail_username` varchar(100) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '邮箱登录账号',
                                `mail_password` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '邮箱授权码（应加密存储）',
                                `mail_protocol` varchar(10) CHARACTER SET utf8mb4 NULL DEFAULT 'smtp' COMMENT '协议类型：smtp/smtps',
                                `mail_enable_tls` tinyint(1) NULL DEFAULT 1 COMMENT '是否启用TLS',
                                `mail_enable_ssl` tinyint(1) NULL DEFAULT 0 COMMENT '是否启用SSL',
                                `mail_default_encoding` varchar(10) CHARACTER SET utf8mb4 NULL DEFAULT 'UTF-8' COMMENT '编码格式',
                                `icp_record_number` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT 'icp备案号',
                                `mps_record_number` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '公安联网备案号',
                                `enable_register` int NULL DEFAULT NULL COMMENT '是否启用用户注册（1：启用，0：禁用）',
                                `enable_music` int NULL DEFAULT NULL COMMENT '是否启用悬浮音乐播放器（1：启用，0：禁用）',
                                `admin_post_no_review` int NULL DEFAULT 0 COMMENT '管理员文章是否无需审核（1：启用，0：禁用）',
                                PRIMARY KEY (`id`) USING BTREE,
                                INDEX `register_user_permission`(`register_user_permission` ASC) USING BTREE,
                                CONSTRAINT `register_user_permission` FOREIGN KEY (`register_user_permission`) REFERENCES `role` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COMMENT = '站点基础设置表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of site_config
-- ----------------------------
INSERT INTO `site_config` VALUES (1, '次元栈 - Dim Stack', 4, '© 2025-2026 次元栈 - Dim Stack. All rights reserved.', 3, 'https://pan.lingview.xyz/d/%E9%9B%A8%E4%BA%91%E8%8A%82%E7%82%B9/%E5%9B%BE%E5%BA%93/%E5%A3%81%E7%BA%B8/mmexport1769432250836.jpg?sign=KFQ9u-fY83wR52PdfpesYywMJi_0M4Uc66vz7A9Tal0=:0', '欢迎使用次元栈', '欢迎大家在 GitHub 上提交 Issue 或 Pull Request！', 'https://pan.lingview.xyz/d/%E9%9B%A8%E4%BA%91%E8%8A%82%E7%82%B9/%E5%9B%BE%E5%BA%93/%E5%A4%A9%E4%BE%9D/Image_1721230292906.png?sign=JU30z6z_RsZ3Vv7HB_5D3msYRneiga5NLjhN3EpL-3w=:0', 'default', 'https://dimstackrepo.apilinks.cn/themes.json', 0, '', NULL, '', '系统通知', '', NULL, 'smtp', 0, 1, 'UTF-8', '', '', 1, 0, 1);

-- ----------------------------
-- Table structure for systematic_notification
-- ----------------------------
DROP TABLE IF EXISTS `systematic_notification`;
CREATE TABLE `systematic_notification`  (
                                            `id` int NOT NULL AUTO_INCREMENT,
                                            `uuid` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '所属用户的uuid',
                                            `content` mediumtext CHARACTER SET utf8mb4 NOT NULL COMMENT '通知内容',
                                            `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                            `type` varchar(50) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '通知类型',
                                            `status` int NOT NULL COMMENT '通知状态2为未读，1为已读，0为删除',
                                            PRIMARY KEY (`id`) USING BTREE,
                                            INDEX `fk_systematic_notification_user_uuid`(`uuid` ASC) USING BTREE,
                                            CONSTRAINT `fk_systematic_notification_user_uuid` FOREIGN KEY (`uuid`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of systematic_notification
-- ----------------------------

-- ----------------------------
-- Table structure for user_information
-- ----------------------------
DROP TABLE IF EXISTS `user_information`;
CREATE TABLE `user_information`  (
                                     `id` int NOT NULL AUTO_INCREMENT COMMENT '用户创建顺序',
                                     `uuid` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '唯一用户id',
                                     `username` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '用户名',
                                     `avatar` text CHARACTER SET utf8mb4 NULL COMMENT '用户头像',
                                     `phone` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '手机号',
                                     `email` varchar(255) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '邮箱',
                                     `gender` enum('male','female','other') CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '性别',
                                     `password` varchar(255) CHARACTER SET utf8mb4 NOT NULL COMMENT '密码',
                                     `birthday` date NULL DEFAULT NULL COMMENT '生日',
                                     `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '用户创建时间',
                                     `status` tinyint NOT NULL COMMENT '用户状态：0=删除, 1=正常, 2=封禁',
                                     PRIMARY KEY (`id`) USING BTREE,
                                     UNIQUE INDEX `uuid`(`uuid` ASC) USING BTREE,
                                     UNIQUE INDEX `username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COMMENT = '用户信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_information
-- ----------------------------
INSERT INTO `user_information` VALUES (1, '075eb86f721743e3940f35869154a140175689381296899805858', 'admin', 'https://pan.lingview.xyz/d/%E9%9B%A8%E4%BA%91%E8%8A%82%E7%82%B9/%E5%9B%BE%E5%BA%93/%E5%A4%A9%E4%BE%9D/-1369486563.jpg?sign=7hdp5soxiEvVYpqvgiWxoJQ2UMJJCcoatm48bajEBkk=:0', NULL, 'official@dimstack.com', NULL, '$2a$10$hNfMxBf3egQkomuMql9LDeMJb2AC9IXkp904GgqX6DAxc8u9i1aAm', NULL, '2025-09-03 18:03:33', 1);

-- ----------------------------
-- Table structure for user_role
-- ----------------------------
DROP TABLE IF EXISTS `user_role`;
CREATE TABLE `user_role`  (
                              `user_id` int NOT NULL COMMENT '用户 ID',
                              `role_id` int NOT NULL COMMENT '角色 ID',
                              PRIMARY KEY (`user_id`, `role_id`) USING BTREE,
                              INDEX `idx_role_id`(`role_id` ASC) USING BTREE,
                              CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
                              CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `user_information` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COMMENT = '用户角色关联表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_role
-- ----------------------------
INSERT INTO `user_role` VALUES (1, 1);

SET FOREIGN_KEY_CHECKS = 1;
