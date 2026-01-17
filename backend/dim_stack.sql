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

 Date: 17/01/2026 20:00:00
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
                            `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文章分类',
                            `alias` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文章访问链接',
                            `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '文章创建时间',
                            `status` tinyint NOT NULL COMMENT '文章状态：0=删除, 1=正常, 2=未发布, 3=待审核，4违规',
                            PRIMARY KEY (`id`) USING BTREE,
                            UNIQUE INDEX `article_id`(`article_id` ASC) USING BTREE,
                            UNIQUE INDEX `alias`(`alias` ASC) USING BTREE,
                            INDEX `user_article_uuid`(`uuid` ASC) USING BTREE,
                            INDEX `categories`(`category` ASC) USING BTREE,
                            INDEX `idx_article_status_ctime`(`status` ASC, `create_time` DESC) USING BTREE,
                            INDEX `idx_article_status_category_ctime`(`status` ASC, `category` ASC, `create_time` DESC) USING BTREE,
                            INDEX `idx_article_status_category_pageviews`(`status` ASC, `category` ASC, `page_views` DESC) USING BTREE,
                            FULLTEXT INDEX `idx_fulltext_cn`(`article_name`, `excerpt`) WITH PARSER `ngram`,
                            FULLTEXT INDEX `idx_fulltext_en`(`article_name`, `excerpt`),
                            CONSTRAINT `categories` FOREIGN KEY (`category`) REFERENCES `article_categories` (`article_categories`) ON DELETE RESTRICT ON UPDATE RESTRICT,
                            CONSTRAINT `fk_article_user` FOREIGN KEY (`uuid`) REFERENCES `user_information` (`uuid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '文章上传记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of article
-- ----------------------------
INSERT INTO `article` VALUES (1, '075eb86f721743e3940f35869154a140175689381296899805858', 'a1d3112d-fd8e-4484-9c3c-bad24a9e2019', '关于', 'https://pan.lingview.xyz/d/%E9%9B%A8%E4%BA%91%E8%8A%82%E7%82%B9/%E5%9B%BE%E5%BA%93/%E5%A4%A9%E4%BE%9D/Image_2756849649102.jpg?sign=nkverrmGB28h2DgiXlGIZBlzD2WMVByK7hNn9zwAJI4=:0', '关于本项目', '# 关于次元栈\n## 🌟 项目简介\n**次元栈** 一个个人练手项目 ps:不要抱太大希望\n\n平台核心功能：\n\n+ 📝 文章发布与内容管理（CMS）\n+ 💬 用户互动：评论、点赞、收藏\n+ 🔖 标签分类：支持跨圈层内容组织\n+ 👥 用户系统：注册、登录、个人主页、权限管理、文章发布管理系统......\n+ 🔍 内容搜索与推荐\n+ 📱 响应式前端，支持移动端浏览\n\n---\n\n## 🛠 技术栈\n\n| 层级       | 技术选型                                                         |\n|------------|--------------------------------------------------------------|\n| **后端**   | Java 17, Spring Boot 3.5, Mybatis, MySQL, Redis, Cookie      |\n| **前端**   | React 19, JavaScript, Vite, Axios, Tailwind CSS              |\n| **构建**   | Maven (后端), npm/pnpm (前端)                                    |\n| **部署**   | Docker, Nginx, Linux, Windows                                |\n---\n\n', 4, 0, 0, '', '默认分类', 'about', '2025-09-13 12:42:47', 1);
INSERT INTO `article` VALUES (2, '075eb86f721743e3940f35869154a140175689381296899805858', '3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1', '致谢', 'https://pan.lingview.xyz/d/%E9%9B%A8%E4%BA%91%E8%8A%82%E7%82%B9/%E5%9B%BE%E5%BA%93/%E5%A4%A9%E4%BE%9D/e5f2f1fe4bfceeb32e88217577732c04.jpg?sign=IA5DnGzWtBhEhYM5e9je4Xx3CqZOMngUd_D4TdLt2X4=:0', '感谢对本项目提供帮助的个人、组织与项目', '# 致谢\n\n在此，我们衷心感谢以下为本项目提供帮助、支持或灵感的个人和组织：\n\n## 贡献者\n感谢所有参与本项目的贡献者（按字母顺序排列）：\n- [@bytegeek](https://github.com/xrb114) - 渗透测试\n- [@lingview](https://github.com/lingview) - 系统开发\n- [@q1uf3ng](https://x.com/q1uf3ng) - 渗透测试\n\n---\n>感谢以下框架、库和工具对本项目的支持 🙏  \n\n\n## 后端依赖（Java / Spring Boot）\n\n### 🌱 Spring 生态\n- [Spring Boot Starter](https://spring.io/projects/spring-boot)  \n- Spring Boot Starter Web  \n- Spring Boot Starter AOP  \n- Spring Boot Starter Mail  \n- Spring Boot Starter WebSocket  \n- Spring Boot Starter Data Redis  \n- Spring Boot Starter Actuator  \n- [Spring Session Data Redis](https://spring.io/projects/spring-session)  \n- Spring Context Support  \n- Spring Web  \n\n### 💾 数据库与持久化\n- [MyBatis Spring Boot Starter](https://github.com/mybatis/spring-boot-starter)  \n- [MySQL Connector/J](https://dev.mysql.com/downloads/connector/j/)  \n- [Druid](https://github.com/alibaba/druid)  \n\n### 🛠 工具类库\n- [Apache Commons IO](https://commons.apache.org/proper/commons-io/)  \n- [Apache Commons Lang3](https://commons.apache.org/proper/commons-lang/)  \n- [Lombok](https://projectlombok.org/)  \n- [Hutool](https://hutool.cn/)  \n\n### 📄 文档与格式解析\n- [Jsoup](https://jsoup.org/)  \n- [Apache POI](https://poi.apache.org/)  \n- [Flexmark](https://github.com/vsch/flexmark-java)  \n\n### 🔐 安全与加密\n- [jBCrypt](https://www.mindrot.org/projects/jBCrypt/)  \n\n### 🔍 JSON 处理\n- [Jackson Databind](https://github.com/FasterXML/jackson-databind)  \n- [Fastjson](https://github.com/alibaba/fastjson)  \n- [Gson](https://github.com/google/gson)  \n\n### ⚙️ 系统与代码分析\n- [OSHI](https://github.com/oshi/oshi)  \n- [JavaParser](https://javaparser.org/)  \n- [CFR Decompiler](https://www.benf.org/other/cfr/)  \n\n### 🌐 其他\n- [juniversalchardet](https://code.google.com/archive/p/juniversalchardet/)  \n- Spring Boot Starter Test  \n\n---\n\n## 前端依赖（React / Vite）\n\n### ⚛️ 核心框架\n- [React](https://react.dev/)  \n- [React DOM](https://react.dev/)  \n- [React Router DOM](https://reactrouter.com/)  \n\n### 🎨 UI 与动画\n- [Framer Motion](https://www.framer.com/motion/)  \n- [Lucide React](https://lucide.dev/)  \n- [React Favicon](https://github.com/oflisback/react-favicon)  \n\n### 📝 Markdown 与富文本\n- [React Markdown](https://github.com/remarkjs/react-markdown)  \n- [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)  \n- [Remark GFM](https://github.com/remarkjs/remark-gfm)  \n- [Remark Parse](https://github.com/remarkjs/remark/tree/main/packages/remark-parse)  \n- [Remark Rehype](https://github.com/remarkjs/remark-rehype)  \n- [Rehype Highlight](https://github.com/rehypejs/rehype-highlight)  \n- [Rehype Raw](https://github.com/rehypejs/rehype-raw)  \n- [Rehype Sanitize](https://github.com/rehypejs/rehype-sanitize)  \n- [Rehype Stringify](https://github.com/rehypejs/rehype/blob/main/packages/rehype-stringify)  \n- [Unified](https://unifiedjs.com/)  \n\n### 🌐 网络请求与安全\n- [Axios](https://axios-http.com/)  \n- [DOMPurify](https://github.com/cure53/DOMPurify)  \n\n### 🛠 构建与样式\n- [Vite](https://vitejs.dev/)  \n- [Tailwind CSS](https://tailwindcss.com/)  \n- [PostCSS](https://postcss.org/)  \n- [Autoprefixer](https://github.com/postcss/autoprefixer)  \n- @tailwindcss/vite  \n- @tailwindcss/postcss  \n\n---\n\n## 💡 特别感谢\n- 感谢所有为本项目贡献代码、提出问题和提供反馈的开发者。  \n- 感谢开源社区持续的支持与贡献。  \n\n---\n\n💡 如果你在本项目中做出了贡献，请提交 PR 将你的名字加入到致谢名单中！  \n', 9, 0, 0, '', '默认分类', 'thanks', '2025-09-14 11:26:52', 1);
INSERT INTO `article` VALUES (3, '075eb86f721743e3940f35869154a140175689381296899805858', '52bffedc-5f09-48f4-a6cf-06a906bc73f4', '面向主题开发者接口文档', 'https://pan.lingview.xyz/d/%E9%9B%A8%E4%BA%91%E8%8A%82%E7%82%B9/%E5%9B%BE%E5%BA%93/%E5%A4%A9%E4%BE%9D/995634982fb64ce47cc81c4ef76d2de6.jpeg?sign=GtlgEHiIGTnGQP2DeNHmlwMhXNPRXoRETbAUJsSl-6k=:0', '面向主题开发者的接口文档，实时更新ing', '# 次元栈 - DimStack\n\n> 主题开发者接口文档\n\n## RouterController - 路由控制器\n**需要主题开发者适配的路由**\n**描述**: 处理所有前端页面的路由请求，将所有匹配的请求转发到 index.html 文件，以便前端路由器（如 React Router 或 Vue Router）能够处理具体的路由逻辑。这些路由需要主题开发者进行适配和实现。\n\n**路径**: 多个路径匹配\n\n**方法类型**: GET\n\n**内容类型**: application/x-www-form-urlencoded\n\n**路径参数**:\n| 路径            | 示例         |\n|-----------------|--------------|\n| `/`             | 无           |\n| `/login`        | 登录页面     |\n| `/register`     | 注册页面     |\n| `/article/**`   | 文章相关路径 |\n| `/category/**`  | 分类相关路径 |\n\n\n## HomeController - 主页面控制器\n### 获取首页文章列表\n**地址:** /api/articles\n\n**请求协议:** GET\n\n\n**内容类型:** application/x-www-form-urlencoded\n\n**描述:** 用于系统首页获取文章列表\n\n\n**请求参数:**\n\n| 参数| 类型 | 是否必须| 描述| 例子|\n|-----------|------|----------|-------------|---------|\n|page|int32|true|页码|1|\n|size|int32|true|每页数量|10|\n\n**请求示例:**\n```bash\ncurl -X GET \"https://apilinks.cn/api/articles?page=1&size=10\"\n```\n**响应字段:**\n\n| 字段       | 类型  | 描述                                         |\n|------------|-------|----------------------------------------------|\n| data       | 对象  | 存储实际数据的对象                           |\n| ├─ data     | 数组  | 包含具体数据项的数组                         |\n| │ ├─ id     | int32 | 数据项的唯一标识                             |\n| │ ├─ article_id | 字符串| 文章的 UUID                              |\n| │ ├─ title  | 字符串| 文章的标题                                 |\n| │ ├─ excerpt| 字符串| 文章的摘要或简介                           |\n| │ ├─ image  | 字符串| 文章的相关图片链接                           |\n| │ ├─ date   | 字符串| 文章的发布日期和时间，格式为 yyyy-MM-dd HH:mm:ss |\n| │ ├─ author | 字符串| 文章的作者名称或标识                         |\n| │ ├─ category| 字符串| 文章所属的分类                         |\n| │ ├─ tag    | 字符串| 文章所属的标签，不同标签使用英文逗号区分                         |\n| │ └─ alias  | 字符串| 文章的别名或URL的一部分                      |\n| ├─ total    | int32 | 数据库中符合条件的数据总数                   |\n| ├─ page     | int32 | 当前返回的数据页码                           |\n| ├─ size     | int32 | 每页返回的数据条目数量                       |\n| └─ total_pages | int32 | 符合条件的数据总共有几页                   |\n\n**响应示例：**\n```json\n{\n    \"data\": [\n        {\n            \"id\": 2,\n            \"article_id\": \"3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1\",\n            \"title\": \"致谢\",\n            \"excerpt\": \"致谢\",\n            \"image\": \"https://pan.apilinks.cn/f/Y5Sw/e5f2f1fe4bfceeb32e88217577732c04.jpg\",\n            \"date\": \"2025-09-14 11:26:52\",\n            \"author\": \"admin\",\n            \"category\": \"默认分类\",\n            \"tag\": \"默认标签,次元栈\",\n            \"alias\": \"thanks\"\n        },\n        {\n            \"id\": 1,\n            \"article_id\": \"a1d3112d-fd8e-4484-9c3c-bad24a9e2019\",\n            \"title\": \"关于\",\n            \"excerpt\": \"关于\",\n            \"image\": \"https://pan.apilinks.cn/f/29um/Image_2756849649102.jpg\",\n            \"date\": \"2025-09-13 12:42:47\",\n            \"author\": \"admin\",\n            \"category\": \"默认分类\",\n            \"tag\": \"默认标签,次元栈\",\n            \"alias\": \"about\"\n        }\n    ],\n    \"total\": 2,\n    \"page\": 1,\n    \"size\": 10,\n    \"total_pages\": 1\n}\n```\n\n\n\n## CaptchaController - 验证码控制器\n### 获取验证码\n**地址:** /api/captcha\n\n**类型:** GET\n\n\n**内容类型:** application/x-www-form-urlencoded\n\n**描述:** 验证码获取\n\n\n**请求示例:**\n```bash\ncurl -X GET -i \"https://apilinks.cn/api/captcha\"\n```\n**响应字段:**\n\n| 字段      | 类型    | 描述                                    | 示例 |\n|-----------|---------|-----------------------------------------|------|\n| image     | 字符串  | 图像的 Base64 编码数据                    | `\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...\"` |\n| success   | 布尔值  | 标识请求是否成功                          | `true` |\n| sessionId | 字符串  | 会话标识符                                | `\"******\"` |\n| key       | 字符串  | 唯一标识                  | `\"3d63f17fe65845e7\"` |\n\n**响应示例：**\n```json\n{\n    \"image\": \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAoCAIAAAC6iKlyAAAB/0lEQVR4Xu3XPU4DMRCG4dRI1HTUSNwiFSWHoeICXMs3m0RZZZj9xn/x2F7vxq9cre2V88QK4kSzLp3wwaxNE7pTE7pTE7pTI0I75/DR/pvQnRoO+pDKNKG7NaE7NRb0UZXpANDuFj4dr2rQ5/cPPXCR6vfthcejXp9f38mBe1R/P68wcEWl0tDJK6N987k3hNbETa3T0EsLtxddy+oBW7jW0N4DU1S5kXUutAzQQ5o51hIa51Jl3lxSB6Y1tFwZem6vBFp2PfoVkT8ANAi07HrUuGZkypIVmtO3hkaClseT0PK0S/Gvobhq0DL+SD2h/yF9yY1ACcv2BM11g/YO3HAvQulSPyzFNYSWyufb77i8OEsF0PwSLVsADZqRKWOtoEEZZhkrCc0rOZ7SspnQpEBDA7cZqg8NxFpZJqFR9BZuEGWahtKseuAeQ5WhH1J26xud6csZoclnDQ9xg6Ga0HFl6ciaoZ8OWObNDu2thTJVhNbKEivkFYKWhV7SArrRdaZa0FoZV/hyGX8MIcltgfY6SmXvAksl0PKKufV/JZGBbymClkno0MA998BUD9xgLhdaysKUNvUO2LW8Z0xoXF2jXOhI2tQ7YNe20BSwxkX1qgBtyQK9r7aElsoTun7g+wzKNAg0rjhiG0Pj3HHbAPo5m9CdmtCdmtCdmtCdugCwGB3v/VPeXwAAAABJRU5ErkJggg==\",\n    \"success\": true,\n    \"sessionId\": \"******\",\n    \"key\": \"3d63f17fe65845e7\"\n}\n```\n\n\n## RegisterController - 用户注册控制器\n### 用户注册接口\n**地址:** /api/register\n\n**请求协议:** POST\n\n\n**内容类型:** application/json\n\n**描述:** 用户注册接口\n\n\n**请求参数:**\n\n| 参数| 类型| 是否必须| 描述| 例子|\n|--------------|----------|----------|---------------------------------------------------------|-----------------------|\n| username     | 字符串   | 是       | 用户名                                                  | `\"dimstack\"`            |\n| email        | 字符串   | 否       | 电子邮件地址                                            | `\"test@example.com\"`    |\n| phone        | 字符串   | 否       | 手机号码，格式需符合 `^1[3-9]\\d{9}$`                    | `\"13800000000\"`         |\n| password     | 字符串   | 是       | 密码                                                    | `\"123456\"`              |\n| captcha      | 字符串   | 是       | 验证码                                                  | `\"pjru\"`                |\n| captchaKey   | 字符串   | 是       | 验证码密钥                                              | `\"8f2d1c2c4fc643dc\"`    |\n\n**请求示例:**\n```bash\ncurl -X POST \"https://apilinks.cn/api/register\" -H \"Content-Type: application/json\" -d \"{\\\"username\\\": \\\"dimstack\\\", \\\"email\\\": \\\"test@example.com\\\", \\\"phone\\\": \\\"13800000000\\\", \\\"password\\\": \\\"123456\\\", \\\"captcha\\\": \\\"pjru\\\", \\\"captchaKey\\\": \\\"8f2d1c2c4fc643dc\\\"}\"\n```\n**响应字段:**\n\n| 字段    | 类型    | 描述                                     | 示例          |\n|---------|---------|------------------------------------------|---------------|\n| data    | 对象    | 存储实际数据的对象                         | -             |\n| ├─ success  | 布尔值  | 标识请求是否成功的布尔值                     | `true`        |\n| ├─ message  | 字符串  | 详细的响应信息                           | `\"注册成功！\"`|\n\n**响应示例：**\n```json\n{\n    \"data\": {\n        \"success\": true,\n        \"message\": \"注册成功！\"\n    }\n}\n```\n\n## LoginController - 用户登录控制器\n### 用户登录接口\n**地址:** /api/login\n\n**请求协议:** POST\n\n\n**内容类型:** application/json\n\n**描述:** 用户登录接口\n\n\n**请求体:**\n\n| 参数       | 类型     | 必填 | 描述                                     | 示例                 |\n|------------|----------|------|------------------------------------------|----------------------|\n| username   | 字符串   | 否   | 用户名                                   | `\"dimstack\"`           |\n| password   | 字符串   | 否   | 密码                                     | `\"123456\"`             |\n| captcha    | 字符串   | 否   | 验证码                                   | `\"2mdn\"`               |\n| captchaKey | 字符串   | 否   | 验证码密钥                               | `\"42ffa3da6b6c4df7\"`     |\n\n**请求示例:**\n```bash\ncurl -X POST \"https://apilinks.cn/api/login\" -H \"Content-Type: application/json\" -H \"Cookie: SESSION=ODJhOGNlYTYtMDk1Yy00M2RlLTk4ZDEtNDhjYTY4MWQ2ZTUy\" -d \"{ \\\"username\\\": \\\"dimstack\\\", \\\"password\\\": \\\"123456\\\", \\\"captcha\\\": \\\"2mdn\\\", \\\"captchaKey\\\": \\\"42ffa3da6b6c4df7\\\"}\"\n```\n**响应字段:**\n\n| 字段    | 类型    | 描述                                     | 示例          |\n|---------|---------|------------------------------------------|---------------|\n| data    | 对象    | 存储实际数据的对象                         | -             |\n| ├─ success| 布尔值  | 标识请求是否成功的布尔值                     | `true`        |\n| ├─ message| 字符串  | 详细的响应信息                           | `\"登录成功\"`    |\n\n**响应示例：**\n```json\n{\n    \"data\": {\n        \"success\": true,\n        \"message\": \"登录成功\"\n    }\n}\n```\n\n### 用户登出接口\n**地址:** /api/logout\n\n**请求协议:** POST\n\n\n**内容类型:** application/x-www-form-urlencoded\n\n**描述:** 用户登出接口\n\n\n**请求示例:**\n```bash\ncurl -X POST -i \"https://apilinks.cn/api/logout\" -H \"Cookie: SESSION=ZTVmYWI2ZjctNTg3Yy00OTBlLWI5ZmItNjFmOTJjYzUzOTg4\"\n```\n**响应字段:**\n\n| 字段    | 类型    | 描述                                     | 示例          |\n|---------|---------|------------------------------------------|---------------|\n| data    | 对象    | 存储实际数据的对象                         | -             |\n| ├─ success| 布尔值  | 标识请求是否成功的布尔值                     | `true`        |\n| ├─ message| 字符串  | 详细的响应信息                           | `\"登出成功\"`    |\n\n**响应示例：**\n```json\n{\n    \"data\": {\n        \"success\": true,\n        \"message\": \"登出成功\"\n    }\n}\n```\n\n\n\n## ArticleSearchController - 文章搜索控制器\n### 搜索文章\n**地址:** /api/articlesearch/search\n\n**请求协议:** GET\n\n**内容类型:** application/x-www-form-urlencoded\n\n**描述:** 文章搜索\n\n**请求参数:**\n\n| 参数    | 类型     | 必填 | 描述           | 示例                |\n|---------|----------|------|----------------|---------------------|\n| keyword | 字符串   | 否   | 搜索关键字     | `%E5%85%B3%E4%BA%8E` (即 URL 编码的 \"关于\") |\n\n**请求示例:**\n```bash\n注：中文需要URL编码\ncurl -X GET -i \"https://apilinks.cn/api/articlesearch/search?keyword=%E5%85%B3%E4%BA%8E\"\n```\n**响应字段:**\n\n| 字段      | 类型    | 描述                                     | 示例          |\n|-----------|---------|------------------------------------------|---------------|\n| data      | 对象    | 存储实际数据的对象                         | -             |\n| ├─ data   | 数组    | 匹配的文章列表                             | -             |\n| │ ├─ title| 字符串  | 文章标题                                 | `\"关于\"`      |\n| │ ├─ alias| 字符串  | 文章别名                                 | `\"help\"`      |\n| │ ├─ id   | int32   | 文章ID                                   | `1`           |\n| │ └─ excerpt| 字符串| 文章摘要                                 | `\"关于次元栈论坛\"` |\n| ├─ count  | int32   | 返回的文章总数                             | `1`           |\n| success   | 布尔值  | 标识请求是否成功的布尔值                     | `true`        |\n\n**响应示例：**\n```json\n{\n    \"count\": 1,\n    \"data\": [\n        {\n            \"alias\": \"help\",\n            \"id\": 1,\n            \"title\": \"关于\",\n            \"excerpt\": \"关于次元栈论坛\"\n        }\n    ],\n    \"success\": true\n}\n```\n\n## TagAndCategoryController - 标签&分类控制器\n### 获取启用的分类\n\n**地址:** /api/categories\n**类型:** GET\n**内容类型:** application/x-www-form-urlencoded\n**描述:**\n**请求示例:**\n\n```bash\ncurl -X GET -i \"https://apilinks.cn/api/categories\"\n```\n**响应字段:**\n\n| 字段                  | 类型     | 描述                                     | 示例                      |\n|-----------------------|----------|------------------------------------------|---------------------------|\n| data                  | 数组     | 存储所有启用分类的信息数组                 | -                         |\n| ├─ id                 | int32    | 分类ID                                   | `1`                       |\n| ├─ article_categories | 字符串   | 分类名称                                 | `\"默认分类\"`              |\n| ├─ categories_explain | 字符串   | 分类说明                                 | `\"默认分类\"`              |\n| ├─ founder            | 字符串   | 创建者标识符                             | `\"075eb86f721743e3940f35869154a140175689381296899805858\"` |\n| ├─ create_time        | 字符串   | 创建时间                                 | `\"2025-09-13T13:35:57\"` |\n| ├─ status             | int32    | 状态（0 表示禁用，1 表示启用）             | `1`                       |\n\n**响应示例：**\n```json\n[\n    {\n        \"id\": 1,\n        \"article_categories\": \"默认分类\",\n        \"categories_explain\": \"默认分类\",\n        \"founder\": \"075eb86f721743e3940f35869154a140175689381296899805858\",\n        \"create_time\": \"2025-09-13T13:35:57\",\n        \"status\": 1\n    }\n]\n```\n\n### 获取所有已启用的分类\n**地址:** /api/categoriesandcount\n\n**请求协议:** GET\n\n\n**内容类型:** application/x-www-form-urlencoded\n\n**描述:**\n\n\n**请求示例:**\n```bash\ncurl -X GET -i \"https://apilinks.cn/api/categoriesandcount\"\n```\n**响应字段:**\n\n| 字段                  | 类型     | 描述                                     | 示例                      |\n|-----------------------|----------|------------------------------------------|---------------------------|\n| data                  | 数组     | 存储所有启用分类及其文章数量的信息数组     | -                         |\n| ├─ id                 | int32    | 分类ID                                   | `1`                       |\n| ├─ article_categories | 字符串   | 分类名称                                 | `\"默认分类\"`              |\n| ├─ categories_explain | 字符串   | 分类说明                                 | `\"默认分类\"`              |\n| ├─ founder            | 字符串   | 创建者标识符                             | `\"075eb86f721743e3940f35869154a140175689381296899805858\"` |\n| ├─ create_time        | 字符串   | 创建时间                                 | `\"2025-09-13T13:35:57\"` |\n| ├─ status             | int32    | 状态（0 表示禁用，1 表示启用）             | `1`                       |\n| ├─ articleCount       | int64    | 该分类下的文章数量                       | `2`                       |\n\n**响应示例：**\n```json\n[\n    {\n        \"id\": 1,\n        \"article_categories\": \"默认分类\",\n        \"categories_explain\": \"默认分类\",\n        \"founder\": \"075eb86f721743e3940f35869154a140175689381296899805858\",\n        \"create_time\": \"2025-09-13T13:35:57\",\n        \"status\": 1,\n        \"articleCount\": 2\n    }\n]\n```\n\n### 获取该分类的所有文章\n**地址:** /api/categories/{category}/articles\n\n**请求协议:** GET\n\n\n**内容类型:** application/x-www-form-urlencoded\n\n**描述:**\n\n\n**请求参数:**\n\n| 参数 | 类型   | 必填 | 描述           | 示例 |\n|------|--------|------|----------------|------|\n| page | int32  | 是   | 当前页码       | `1`  |\n| size | int32  | 是   | 每页显示的文章数 | `10` |\n\n**请求示例:**\n```bash\ncurl -X GET -i \"https://apilinks.cn/api/categories/%E9%BB%98%E8%AE%A4%E5%88%86%E7%B1%BB/articles?page=1&size=10\"\n```\n**响应字段:**\n\n| 字段           | 类型   | 描述                                     | 示例                      |\n|----------------|--------|------------------------------------------|---------------------------|\n| data           | 对象   | 包含文章列表及分页信息的对象             | -                         |\n| ├─ data         | 数组   | 文章列表                                 | -                         |\n| │ ├─ id         | int32  | 文章ID                                   | `2`                       |\n| │ ├─ article_id | 字符串 | 文章唯一标识符                           | `\"3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1\"` |\n| │ ├─ title      | 字符串 | 文章标题                                 | `\"致谢\"`                  |\n| │ ├─ excerpt    | 字符串 | 文章摘要                                 | `\"致谢\"`                  |\n| │ ├─ image      | 字符串 | 文章封面图 URL                           | `\"https://pan.apilinks.cn/f/Y5Sw/e5f2f1fe4bfceeb32e88217577732c04.jpg\"` |\n| │ ├─ date       | 字符串 | 发布日期                                 | `\"2025-09-14 11:26:52\"` |\n| │ ├─ author     | 字符串 | 作者                                     | `\"admin\"`                 |\n| │ ├─ category   | 字符串 | 文章所属分类                             | `\"默认分类\"`              |\n| │ ├─ tag        | 字符串 | 文章所属标签                             | `\"次元栈,默认标签\"`              |\n| │ └─ alias      | 字符串 | 文章别名                                 | `\"thanks\"`                |\n| ├─ total        | int32  | 总文章数                                 | `3`                       |\n| ├─ page         | int32  | 当前页码                                 | `1`                       |\n| ├─ size         | int32  | 每页显示的文章数                         | `10`                      |\n| └─ total_pages  | int32  | 总页数                                   | `1`                       |\n**响应示例：**\n```json\n{\n    \"data\": [\n        {\n            \"id\": 2,\n            \"article_id\": \"3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1\",\n            \"title\": \"致谢\",\n            \"excerpt\": \"致谢\",\n            \"image\": \"https://pan.apilinks.cn/f/Y5Sw/e5f2f1fe4bfceeb32e88217577732c04.jpg\",\n            \"date\": \"2025-09-14 11:26:52\",\n            \"author\": \"admin\",\n            \"category\": \"默认分类\",\n            \"tag\": \"次元栈,默认标签\",\n            \"alias\": \"thanks\"\n        },\n        {\n            \"id\": 1,\n            \"article_id\": \"a1d3112d-fd8e-4484-9c3c-bad24a9e2019\",\n            \"title\": \"关于\",\n            \"excerpt\": \"关于\",\n            \"image\": \"https://pan.apilinks.cn/f/29um/Image_2756849649102.jpg\",\n            \"date\": \"2025-09-13 12:42:47\",\n            \"author\": \"admin\",\n            \"category\": \"默认分类\",\n            \"tag\": \"次元栈,默认标签\",\n            \"alias\": \"about\"\n        }\n    ],\n    \"total\": 3,\n    \"page\": 1,\n    \"size\": 10,\n    \"total_pages\": 1\n}\n```\n\n\n### 获取该标签的所有文章\n**地址:** /api/tags/{tag}/articles\n\n**请求协议:** GET\n\n\n**内容类型:** application/x-www-form-urlencoded\n\n**描述:**\n\n\n**请求参数:**\n\n| 参数 | 类型   | 必填 | 描述           | 示例 |\n|------|--------|------|----------------|------|\n| page | int32  | 是   | 当前页码       | `1`  |\n| size | int32  | 是   | 每页显示的文章数 | `10` |\n\n**请求示例:**\n```bash\ncurl -X GET -i \"https://apilinks.cn/api/tags/%e9%bb%98%e8%ae%a4%e6%a0%87%e7%ad%be/articles?page=1&size=10\"\n```\n**响应字段:**\n\n| 字段           | 类型   | 描述                                     | 示例                      |\n|----------------|--------|------------------------------------------|---------------------------|\n| data           | 对象   | 包含文章列表及分页信息的对象             | -                         |\n| ├─ data         | 数组   | 文章列表                                 | -                         |\n| │ ├─ id         | int32  | 文章ID                                   | `2`                       |\n| │ ├─ article_id | 字符串 | 文章唯一标识符                           | `\"3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1\"` |\n| │ ├─ title      | 字符串 | 文章标题                                 | `\"致谢\"`                  |\n| │ ├─ excerpt    | 字符串 | 文章摘要                                 | `\"致谢\"`                  |\n| │ ├─ image      | 字符串 | 文章封面图 URL                           | `\"https://pan.apilinks.cn/f/Y5Sw/e5f2f1fe4bfceeb32e88217577732c04.jpg\"` |\n| │ ├─ date       | 字符串 | 发布日期                                 | `\"2025-09-14 11:26:52\"` |\n| │ ├─ author     | 字符串 | 作者                                     | `\"admin\"`                 |\n| │ ├─ category   | 字符串 | 文章所属分类                             | `\"默认分类\"`              |\n| │ ├─ tag        | 字符串 | 文章所属标签                             | `\"次元栈,默认标签\"`              |\n| │ └─ alias      | 字符串 | 文章别名                                 | `\"thanks\"`                |\n| ├─ total        | int32  | 总文章数                                 | `3`                       |\n| ├─ page         | int32  | 当前页码                                 | `1`                       |\n| ├─ size         | int32  | 每页显示的文章数                         | `10`                      |\n| └─ total_pages  | int32  | 总页数                                   | `1`                       |\n**响应示例：**\n```json\n{\n    \"data\": [\n        {\n            \"id\": 3,\n            \"article_id\": \"52bffedc-5f09-48f4-a6cf-06a906bc73f4\",\n            \"title\": \"面向主题开发者接口文档\",\n            \"excerpt\": \"面向主题开发者的接口文档\",\n            \"image\": \"https://pan.apilinks.cn/f/gMik/995634982fb64ce47cc81c4ef76d2de6.jpeg\",\n            \"date\": \"2025-09-25 21:57:39\",\n            \"author\": \"admin\",\n            \"category\": \"接口文档\",\n            \"tag\": \"接口文档,默认标签\",\n            \"alias\": \"themeapi\"\n        },\n        {\n            \"id\": 2,\n            \"article_id\": \"3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1\",\n            \"title\": \"致谢\",\n            \"excerpt\": \"致谢\",\n            \"image\": \"https://pan.apilinks.cn/f/Y5Sw/e5f2f1fe4bfceeb32e88217577732c04.jpg\",\n            \"date\": \"2025-09-14 11:26:52\",\n            \"author\": \"admin\",\n            \"category\": \"默认分类\",\n            \"tag\": \"默认标签\",\n            \"alias\": \"thanks\"\n        },\n        {\n            \"id\": 1,\n            \"article_id\": \"a1d3112d-fd8e-4484-9c3c-bad24a9e2019\",\n            \"title\": \"关于\",\n            \"excerpt\": \"关于\",\n            \"image\": \"https://pan.apilinks.cn/f/29um/Image_2756849649102.jpg\",\n            \"date\": \"2025-09-13 12:42:47\",\n            \"author\": \"admin\",\n            \"category\": \"默认分类\",\n            \"tag\": \"默认标签\",\n            \"alias\": \"about\"\n        }\n    ],\n    \"total\": 3,\n    \"page\": 1,\n    \"size\": 10,\n    \"total_pages\": 1\n}\n```\n\n\n\n## HotArticleController - 热门文章控制器\n### 获取热门文章\n**地址:** /api/hot/articles\n\n**请求协议:** GET\n\n\n**内容类型:** application/x-www-form-urlencoded\n\n**描述:**\n\n**请求示例:**\n```bash\ncurl -X GET -i \"https://apilinks.cn/api/hot/articles\"\n```\n**响应字段:**\n\n| 字段         | 类型     | 描述                             | 示例                          |\n|--------------|----------|----------------------------------|-------------------------------|\n| data         | 数组     | 存储热门文章的信息数组             | -                             |\n| ├─ id         | int32    | 文章ID                           | `2`                           |\n| ├─ article_id | 字符串   | 文章唯一标识符                   | `\"3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1\"` |\n| ├─ title      | 字符串   | 文章标题                         | `\"致谢\"`                      |\n| ├─ excerpt    | 字符串   | 文章摘要                         | `\"参与次元栈论坛项目的朋友\"`  |\n| ├─ date       | 字符串   | 发布日期                         | `\"2025-09-14 11:26:52\"`       |\n| ├─ author     | 字符串   | 作者                             | `\"lingview\"`                  |\n| ├─ category   | 字符串   | 文章所属分类                     | `\"默认分类\"`                  |\n| ├─ page_views | int32    | 浏览次数                         | `53`                          |\n| └─ alias      | 字符串   | 文章别名                         | `\"thanks\"`                    |\n\n**响应示例：**\n```json\n[\n    {\n        \"id\": 2,\n        \"article_id\": \"3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1\",\n        \"title\": \"致谢\",\n        \"excerpt\": \"参与次元栈论坛项目的朋友\",\n        \"date\": \"2025-09-14 11:26:52\",\n        \"author\": \"lingview\",\n        \"category\": \"默认分类\",\n        \"page_views\": 53,\n        \"alias\": \"thanks\"\n    },\n    {\n        \"id\": 1,\n        \"article_id\": \"a1d3112d-fd8e-4484-9c3c-bad24a9e2019\",\n        \"title\": \"关于\",\n        \"excerpt\": \"关于次元栈论坛\",\n        \"date\": \"2025-09-13 12:42:47\",\n        \"author\": \"lingview\",\n        \"category\": \"默认分类\",\n        \"page_views\": 44,\n        \"alias\": \"help\"\n    }\n]\n```\n\n\n## CommentController - 评论控制器\n### 获取该文章下所有评论\n**地址:** /api/comments/article/{articleAlias}\n\n**请求协议:** GET\n\n\n**内容类型:** application/x-www-form-urlencoded\n\n**描述:**\n\n\n**请求示例:**\n```bash\ncurl -X GET -i \"https://apilinks.cn/api/comments/article/thanks\"\n```\n**响应字段:**\n\n| 字段                | 类型   | 描述                                | 示例                          |\n|---------------------|--------|-------------------------------------|-------------------------------|\n| data                | 数组   | 存储评论及子评论的信息数组          | -                             |\n| ├─ comment_id        | 字符串 | 评论唯一标识符                    | `\"ef5bc7a4-435c-4f0e-a9b3-dcbd678010a4\"` |\n| ├─ user_id           | 字符串 | 用户唯一标识符                    | `\"5fd777d3290540ac8eca0ccc84ebb1eb175783255951989608445\"` |\n| ├─ username          | 字符串 | 用户名                              | `\"hanbingniao\"`               |\n| ├─ avatar            | 字符串 | 用户头像 URL                        | `null` 或 `\"/upload/admin/avatar/avatar-4b584fdb-38a7-4c27-8d56-ec72f4bab50c-1757829520.png\"` |\n| ├─ content           | 字符串 | 评论内容                            | `\"\\uD83D\\uDC4D\"`              |\n| ├─ create_time       | 字符串 | 评论创建时间                        | `\"2025-09-14T14:49:39\"`       |\n| ├─ comment_like_count| int64  | 评论点赞数                          | `0`                           |\n| ├─ to_comment_id     | 字符串 | 回复评论的唯一标识符（如果存在）    | `null` 或 `\"ef5bc7a4-435c-4f0e-a9b3-dcbd678010a4\"` |\n| ├─ to_comment_user_id| 字符串 | 回复用户的唯一标识符（如果存在）    | `null` 或 `\"075eb86f721743e3940f35869154a140175689381296899805858\"` |\n| ├─ to_comment_username| 字符串 | 回复用户名（如果存在）              | `null` 或 `\"lingview\"`          |\n| ├─ article_id        | 字符串 | 关联文章的唯一标识符              | `null`                        |\n| ├─ article_title     | 字符串 | 关联文章的标题                    | `null`                        |\n| ├─ status            | int32  | 评论状态（例如：0 表示禁用，1 表示启用） | `null`                        |\n| ├─ children          | 数组   | 子评论列表                          | -                             |\n| │ ├─ comment_id      | 字符串 | 子评论唯一标识符                  | `\"ce07e85f-1c71-4ab4-a31c-f1b05531ee94\"` |\n| │ ├─ user_id         | 字符串 | 子评论用户的唯一标识符            | `\"075eb86f721743e3940f35869154a140175689381296899805858\"` |\n| │ ├─ username        | 字符串 | 子评论用户名                      | `\"lingview\"`                  |\n| │ ├─ avatar          | 字符串 | 子评论用户头像 URL                | `\"/upload/lmt/avatar/avatar-cc57801d-cf81-4a0b-b7f6-eae0edbc131d-1758351584.jpg\"` |\n| │ ├─ content         | 字符串 | 子评论内容                        | `\"好久不见hhh\"`               |\n| │ ├─ create_time     | 字符串 | 子评论创建时间                    | `\"2025-09-14T14:57:24\"`       |\n| │ ├─ comment_like_count| int64 | 子评论点赞数                      | `0`                           |\n| │ ├─ to_comment_id   | 字符串 | 子评论回复的评论唯一标识符（如果存在） | `null` 或 `\"ef5bc7a4-435c-4f0e-a9b3-dcbd678010a4\"` |\n| │ ├─ to_comment_user_id| 字符串 | 子评论回复的用户唯一标识符（如果存在） | `null`                        |\n| │ ├─ to_comment_username| 字符串 | 子评论回复的用户名（如果存在）    | `null`                        |\n| │ ├─ article_id      | 字符串 | 关联子评论的文章唯一标识符        | `null`                        |\n| │ ├─ article_title   | 字符串 | 关联子评论的文章标题              | `null`                        |\n| │ ├─ status          | int32  | 子评论状态（例如：0 表示禁用，1 表示启用） | `null`                        |\n| │ └─ is_liked        | 布尔值  | 当前用户是否点赞                 | `null`                        |\n\n**响应示例：**\n```json\n[\n    {\n        \"comment_id\": \"13448949-ec6d-4b0a-a6d1-cda606734d64\",\n        \"user_id\": \"075eb86f721743e3940f35869154a140175689381296899805858\",\n        \"username\": \"admin\",\n        \"avatar\": \"/upload/admin/avatar/avatar-3e04e348-8bef-4abe-a164-572e0421f17e-1757579183.jpeg\",\n        \"content\": \"Hello World\",\n        \"create_time\": \"2025-09-25T21:44:33\",\n        \"comment_like_count\": 2,\n        \"to_comment_id\": null,\n        \"to_comment_user_id\": null,\n        \"to_comment_username\": null,\n        \"article_id\": null,\n        \"article_title\": null,\n        \"status\": null,\n        \"is_liked\": true,\n        \"children\": [\n            {\n                \"comment_id\": \"f97090ef-7b31-4beb-aefd-5bab5c2bd07c\",\n                \"user_id\": \"075eb86f721743e3940f35869154a140175689381296899805858\",\n                \"username\": \"admin\",\n                \"avatar\": \"/upload/admin/avatar/avatar-3e04e348-8bef-4abe-a164-572e0421f17e-1757579183.jpeg\",\n                \"content\": \"你好世界\",\n                \"create_time\": \"2025-09-25T21:44:46\",\n                \"comment_like_count\": 1,\n                \"to_comment_id\": \"13448949-ec6d-4b0a-a6d1-cda606734d64\",\n                \"to_comment_user_id\": null,\n                \"to_comment_username\": null,\n                \"article_id\": null,\n                \"article_title\": null,\n                \"status\": null,\n                \"is_liked\": true,\n                \"children\": [\n                    {\n                        \"comment_id\": \"9685f56b-38f7-4493-b62a-c9abc93a481e\",\n                        \"user_id\": \"d6fe60a7bfd64d86a547d8f335af2e94175880793855984296059\",\n                        \"username\": \"test\",\n                        \"avatar\": null,\n                        \"content\": \"好久不见\",\n                        \"create_time\": \"2025-09-25T21:46:18\",\n                        \"comment_like_count\": 0,\n                        \"to_comment_id\": \"f97090ef-7b31-4beb-aefd-5bab5c2bd07c\",\n                        \"to_comment_user_id\": null,\n                        \"to_comment_username\": null,\n                        \"article_id\": null,\n                        \"article_title\": null,\n                        \"status\": null,\n                        \"is_liked\": false,\n                        \"children\": []\n                    }\n                ]\n            },\n            {\n                \"comment_id\": \"2838e598-aa84-4456-8639-9347708539ff\",\n                \"user_id\": \"d6fe60a7bfd64d86a547d8f335af2e94175880793855984296059\",\n                \"username\": \"test\",\n                \"avatar\": null,\n                \"content\": \"hello\",\n                \"create_time\": \"2025-09-25T21:46:30\",\n                \"comment_like_count\": 0,\n                \"to_comment_id\": \"13448949-ec6d-4b0a-a6d1-cda606734d64\",\n                \"to_comment_user_id\": null,\n                \"to_comment_username\": null,\n                \"article_id\": null,\n                \"article_title\": null,\n                \"status\": null,\n                \"is_liked\": false,\n                \"children\": []\n            }\n        ]\n    },\n    {\n        \"comment_id\": \"d38fd390-bdf4-4b22-bf90-4449d3f4137c\",\n        \"user_id\": \"d6fe60a7bfd64d86a547d8f335af2e94175880793855984296059\",\n        \"username\": \"test\",\n        \"avatar\": null,\n        \"content\": \"评论测试\",\n        \"create_time\": \"2025-09-25T21:46:09\",\n        \"comment_like_count\": 0,\n        \"to_comment_id\": null,\n        \"to_comment_user_id\": null,\n        \"to_comment_username\": null,\n        \"article_id\": null,\n        \"article_title\": null,\n        \"status\": null,\n        \"is_liked\": false,\n        \"children\": []\n    }\n]\n```\n\n### 添加评论\n**地址:** /api/comments\n\n**请求协议:** POST\n\n\n**内容类型:** application/json\n\n**描述:**\n\n\n**请求体:**\n\n| 参数          | 类型   | 必填 | 描述                                | 示例                |\n|---------------|--------|------|-------------------------------------|---------------------|\n| article_alias | 字符串 | 是   | 文章别名                            | `thanks`            |\n| content       | 字符串 | 是   | 评论内容                            | `\"接口测试\"`        |\n| to_comment_id | 字符串 | 否   | 回复的评论唯一标识符（如果存在）    | `\"\"` 或 `上级评论id` |\n\n**请求示例:**\n```bash\ncurl -X POST -H \"Content-Type: application/json\" -H \"Cookie: SESSION=YTI2MDM3OWUtYThhNi00ZTEwLTg3MTMtYjU4Y2YyOTAyNGZj\" -i \"https://apilinks.cn/api/comments\" --data \"{\\\"article_alias\\\": \\\"thanks\\\", \\\"content\\\": \\\"接口测试\\\", \\\"to_comment_id\\\": \\\"\\\"}\"\n```\n**响应字段:**\n\n成功发送后返回空响应体，返回http状态码200\n\n**响应示例：**\n```json\n无\n```\n\n### 点赞评论\n**地址:** /api/comments/{commentId}/like\n\n**请求协议:** POST\n\n\n**内容类型:** application/x-www-form-urlencoded\n\n**描述:**\n\n\n**请求参数:**\n\n| 参数     | 类型   | 必填 | 描述              | 示例                                   |\n|----------|--------|------|-------------------|----------------------------------------|\n| commentId| 字符串 | 是   | 评论唯一标识符    | `f7e8930a-becf-42ee-a3f4-6a09d6af837c` |\n\n**请求示例:**\n```bash\ncurl -X POST -H \"Cookie: SESSION=YTI2MDM3OWUtYThhNi00ZTEwLTg3MTMtYjU4Y2YyOTAyNGZj\" -i \"https://apilinks.cn/api/comments/f7e8930a-becf-42ee-a3f4-6a09d6af837c/like\"\n```\n**响应字段:**\n\n成功点赞后返回空响应体，返回http状态码200\n\n**响应示例：**\n```json\n无\n```\n\n### 删除评论\n**地址:** /api/comments/{commentId}\n\n**请求协议:** DELETE\n\n\n**内容类型:** application/x-www-form-urlencoded\n\n**描述:**\n\n\n**请求参数:**\n\n| 参数     | 类型   | 必填 | 描述              | 示例                                   |\n|----------|--------|------|-------------------|----------------------------------------|\n| commentId| 字符串 | 是   | 评论唯一标识符    | `239afa5d-37af-4aad-9aee-26cea17353b0` |\n\n**请求示例:**\n```bash\ncurl -X DELETE -H \"Cookie: SESSION=YTI2MDM3OWUtYThhNi00ZTEwLTg3MTMtYjU4Y2YyOTAyNGZj\" -i \"https://apilinks.cn/api/comments/239afa5d-37af-4aad-9aee-26cea17353b0\"\n```\n**响应字段:**\n\n成功删除后返回空响应体，返回http状态码200\n\n**响应示例：**\n```json\n获取用户登录状态\n```\n\n## UserController - 用户控制器\n### getUserStatus\n**地址:** /api/user/status\n\n**类型:** GET\n\n\n**内容类型:** application/x-www-form-urlencoded\n\n**描述:**\n\n\n**请求示例:**\n```bash\ncurl -X GET -H \"Cookie: SESSION=YTI2MDM3OWUtYThhNi00ZTEwLTg3MTMtYjU4Y2YyOTAyNGZj\" -i \"https://apilinks.cn/api/user/status\"\n```\n**响应字段:**\n\n| 字段       | 类型    | 描述                    | 示例             |\n|------------|---------|-------------------------|------------------|\n| data       | 对象    | 数据对象                |                  |\n| └─ loggedIn| 布尔值  | 是否已登录              | `true`           |\n| └─ username| 字符串  | 用户名                  | `\"lingview\"`     |\n| └─ message| 字符串  | 用户状态消息            | `\"\"`             |\n\n**响应示例：**\n```json\n{\n  \"loggedIn\": true,\n  \"username\": \"lingview\"\n}\n```\n\n\n## ReadArticleController - 文章阅读控制器\n### 检查文章密码\n**地址:** http://{{server}}/api/article/{alias}/check-password\n\n**请求协议:** GET\n\n\n**内容类型:** application/x-www-form-urlencoded\n\n**描述:**\n\n\n**请求参数:**\n\n| 参数   | 类型   | 必填 | 描述              | 示例               |\n|--------|--------|------|-------------------|--------------------|\n| alias  | 字符串 | 是   | 文章别名          | `thanks`           |\n\n**请求示例:**\n```bash\ncurl -X GET -i \"https://apilinks.cn/api/article/thanks/check-password\"\n```\n**响应字段:**\n\n| 字段       | 类型    | 描述                    | 示例                 |\n|------------|---------|-------------------------|----------------------|\n| data       | 对象    | 数据对象                |                      |\n| └─ success| 布尔值  | 请求是否成功            | `true`               |\n| └─ needPassword| 布尔值| 文章是否需要密码        | `false`              |\n\n**响应示例：**\n```json\n{\n  \"success\": true,\n  \"needPassword\": false\n}\n```\n\n### 获取文章内容\n\n**地址:** /api/article/{alias}\n\n**类型:** GET\n\n\n**内容类型:** application/x-www-form-urlencoded\n\n**描述:**\n\n\n**请求参数:**\n| 参数   | 类型   | 必填 | 描述              | 示例               |\n|--------|--------|------|-------------------|--------------------|\n| alias  | 字符串 | 是   | 文章别名          | `about`            |\n| password | 字符串 | 否   | 文章密码          | `mysecretpassword` |\n\n**请求示例:**\n```bash\ncurl -X GET -i \'http://{{server}}/api/article/{alias}?password=\'\n```\n**响应字段:**\n\n| 字段       | 类型    | 描述                    | 示例                 |\n|------------|---------|-------------------------|----------------------|\n| data       | 对象    | 数据对象                |                      |\n| └─ id      | 整数    | 文章 ID                 | `1`                  |\n| └─ uuid    | 字符串  | 文章作者 UUID               | `\"075eb86f721743e3940f35869154a140175689381296899805858\"` |\n| └─ article_id | 字符串 | 文章唯一标识符        | `\"a1d3112d-fd8e-4484-9c3c-bad24a9e2019\"` |\n| └─ article_name | 字符串 | 文章标题              | `\"关于\"`             |\n| └─ article_cover | 字符串 | 文章封面图          | `\"https://pan.apilinks.cn/f/29um/Image_2756849649102.jpg\"` |\n| └─ excerpt  | 字符串  | 文章摘要              | `\"关于次元栈论坛\"`   |\n| └─ article_content | 字符串 | 文章内容            | `\"# 关于次元栈\\n## \\uD83C\\uDF1F 项目简介\\n\\n**次元栈** 是一个面向多元兴趣群体的内容社区平台，致力于为 **Vsinger 爱好者**、**Minecraft 创作者** 与 **计算机技术爱好者** 提供一个自由表达、知识共享与创作沉淀的空间。\\n\\n平台核心功能：\\n- \\uD83D\\uDCDD 文章发布与内容管理（CMS）\\n- \\uD83D\\uDCAC 用户互动：评论、点赞、收藏\\n- \\uD83D\\uDD16 标签分类：支持跨圈层内容组织（如 #洛天依、#乐正绫、#星尘、#红石电路、#Java）\\n- \\uD83D\\uDC65 用户系统：注册、登录、个人主页\\n- \\uD83D\\uDD0D 内容搜索与推荐\\n- \\uD83D\\uDCF1 响应式前端，支持移动端浏览\\n\\n---\\n\\n## \\uD83D\\uDEE0 技术栈\\n\\n| 层级       | 技术选型                                                         |\\n|------------|--------------------------------------------------------------|\\n| **后端**   | Java 17, Spring Boot 3.5, Mybatis, MySQL, Redis, Cookie      |\\n| **前端**   | React 19, JavaScript, Vite, Axios, Tailwind CSS              |\\n| **构建**   | Maven (后端), npm/pnpm (前端)                                    |\\n| **部署**   | Docker, Nginx, Linux, Windows                                |\\n---\\n\\n\"` |\n| └─ page_views  | 整数    | 阅读次数              | `48`                 |\n| └─ like_count  | 整数    | 点赞次数              | `0`                  |\n| └─ favorite_count | 整数    | 收藏次数            | `0`                  |\n| └─ password  | 字符串  | 文章密码              | `\"\"`                 |\n| └─ tag  | 字符串  | 文章标签              | `\"默认标签\"`         |\n| └─ category  | 字符串  | 文章分类              | `\"默认分类\"`         |\n| └─ alias  | 字符串  | 文章别名              | `\"about\"`            |\n| └─ create_time | 字符串  | 创建时间              | `\"2025-09-13 12:42:47\"` |\n| └─ status  | 整数    | 文章状态              | `1`                  |\n| success    | 布尔值  | 请求是否成功          | `true`               |\n\n**响应示例：**\n```json\n{\n  \"data\": {\n    \"id\": 1,\n    \"uuid\": \"075eb86f721743e3940f35869154a140175689381296899805858\",\n    \"article_id\": \"a1d3112d-fd8e-4484-9c3c-bad24a9e2019\",\n    \"article_name\": \"关于\",\n    \"article_cover\": \"https://pan.apilinks.cn/f/29um/Image_2756849649102.jpg\",\n    \"excerpt\": \"关于次元栈论坛\",\n    \"article_content\": \"# 关于次元栈\\n## \\uD83C\\uDF1F 项目简介\\n\\n**次元栈** 是一个面向多元兴趣群体的内容社区平台，致力于为 **Vsinger 爱好者**、**Minecraft 创作者** 与 **计算机技术爱好者** 提供一个自由表达、知识共享与创作沉淀的空间。\\n\\n平台核心功能：\\n- \\uD83D\\uDCDD 文章发布与内容管理（CMS）\\n- \\uD83D\\uDCAC 用户互动：评论、点赞、收藏\\n- \\uD83D\\uDD16 标签分类：支持跨圈层内容组织（如 #洛天依、#乐正绫、#星尘、#红石电路、#Java）\\n- \\uD83D\\uDC65 用户系统：注册、登录、个人主页\\n- \\uD83D\\uDD0D 内容搜索与推荐\\n- \\uD83D\\uDCF1 响应式前端，支持移动端浏览\\n\\n---\\n\\n## \\uD83D\\uDEE0 技术栈\\n\\n| 层级       | 技术选型                                                         |\\n|------------|--------------------------------------------------------------|\\n| **后端**   | Java 17, Spring Boot 3.5, Mybatis, MySQL, Redis, Cookie      |\\n| **前端**   | React 19, JavaScript, Vite, Axios, Tailwind CSS              |\\n| **构建**   | Maven (后端), npm/pnpm (前端)                                    |\\n| **部署**   | Docker, Nginx, Linux, Windows                                |\\n---\\n\\n\",\n    \"page_views\": 48,\n    \"like_count\": 0,\n    \"favorite_count\": 0,\n    \"password\": \"\",\n    \"tag\": \"默认标签\",\n    \"category\": \"默认分类\",\n    \"alias\": \"about\",\n    \"create_time\": \"2025-09-13 12:42:47\",\n    \"status\": 1\n  },\n  \"success\": true\n}\n```\n\n', 6, 0, 0, '', '接口文档', 'themeapi', '2025-09-25 21:57:39', 1);

-- ----------------------------
-- Table structure for article_categories
-- ----------------------------
DROP TABLE IF EXISTS `article_categories`;
CREATE TABLE `article_categories`  (
                                       `id` int NOT NULL AUTO_INCREMENT,
                                       `article_categories` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '分类名称',
                                       `categories_explain` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '分类说明',
                                       `founder` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '创建人',
                                       `article_count` int NOT NULL DEFAULT 0 COMMENT '文章数量',
                                       `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
                                       `status` int NOT NULL COMMENT '分类状态：0=禁用, 1=启用',
                                       PRIMARY KEY (`id`) USING BTREE,
                                       UNIQUE INDEX `article_categories`(`article_categories` ASC) USING BTREE,
                                       INDEX `categories_founder`(`founder` ASC) USING BTREE,
                                       CONSTRAINT `categories_founder` FOREIGN KEY (`founder`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE SET NULL
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of article_categories
-- ----------------------------
INSERT INTO `article_categories` VALUES (1, '默认分类', '默认分类', '075eb86f721743e3940f35869154a140175689381296899805858', 2, '2025-09-13 13:35:57', 1);
INSERT INTO `article_categories` VALUES (2, '接口文档', '接口文档', '075eb86f721743e3940f35869154a140175689381296899805858', 1, '2025-09-25 21:53:26', 1);

-- ----------------------------
-- Table structure for article_like
-- ----------------------------
DROP TABLE IF EXISTS `article_like`;
CREATE TABLE `article_like`  (
                                 `id` int NOT NULL AUTO_INCREMENT,
                                 `article_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
                                 `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
                                 `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 PRIMARY KEY (`id`) USING BTREE,
                                 INDEX `fk_like_article`(`article_id` ASC) USING BTREE,
                                 INDEX `fk_user_id`(`user_id` ASC) USING BTREE,
                                 CONSTRAINT `fk_like_article` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                 CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of article_like
-- ----------------------------

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
                                `status` int NOT NULL COMMENT '标签状态：0=禁用, 1=启用',
                                PRIMARY KEY (`id`) USING BTREE,
                                UNIQUE INDEX `tag_name`(`tag_name` ASC) USING BTREE,
                                INDEX `tag_founder`(`founder` ASC) USING BTREE,
                                CONSTRAINT `tag_founder` FOREIGN KEY (`founder`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of article_tag
-- ----------------------------
INSERT INTO `article_tag` VALUES (1, '默认标签', '默认标签', '075eb86f721743e3940f35869154a140175689381296899805858', '2025-09-13 13:33:24', 1);
INSERT INTO `article_tag` VALUES (2, '接口文档', '接口文档', '075eb86f721743e3940f35869154a140175689381296899805858', '2025-09-28 19:15:13', 1);

-- ----------------------------
-- Table structure for article_tag_relation
-- ----------------------------
DROP TABLE IF EXISTS `article_tag_relation`;
CREATE TABLE `article_tag_relation`  (
                                         `article_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文章id',
                                         `article_tag` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文章标签',
                                         INDEX `article_id`(`article_id` ASC) USING BTREE,
                                         INDEX `article_tag`(`article_tag` ASC) USING BTREE,
                                         CONSTRAINT `article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                         CONSTRAINT `article_tag` FOREIGN KEY (`article_tag`) REFERENCES `article_tag` (`tag_name`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of article_tag_relation
-- ----------------------------
INSERT INTO `article_tag_relation` VALUES ('52bffedc-5f09-48f4-a6cf-06a906bc73f4', '默认标签');
INSERT INTO `article_tag_relation` VALUES ('52bffedc-5f09-48f4-a6cf-06a906bc73f4', '接口文档');
INSERT INTO `article_tag_relation` VALUES ('a1d3112d-fd8e-4484-9c3c-bad24a9e2019', '默认标签');
INSERT INTO `article_tag_relation` VALUES ('3cb9d2eb-bd24-486e-bb56-c6dc9332b4f1', '默认标签');

-- ----------------------------
-- Table structure for attachment
-- ----------------------------
DROP TABLE IF EXISTS `attachment`;
CREATE TABLE `attachment`  (
                               `id` int NOT NULL AUTO_INCREMENT COMMENT '上传顺序',
                               `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户唯一id',
                               `attachment_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '附件唯一id',
                               `attachment_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '附件路径',
                               `access_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '文件访问键',
                               `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '上传时间',
                               `status` tinyint NOT NULL COMMENT '附件状态：0=删除, 1=正常',
                               PRIMARY KEY (`id`) USING BTREE,
                               UNIQUE INDEX `attachment_id`(`attachment_id` ASC) USING BTREE,
                               UNIQUE INDEX `attachment_path`(`attachment_path` ASC) USING BTREE,
                               UNIQUE INDEX `access_key`(`access_key` ASC) USING BTREE,
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
-- Table structure for comment_like
-- ----------------------------
DROP TABLE IF EXISTS `comment_like`;
CREATE TABLE `comment_like`  (
                                 `id` int NOT NULL AUTO_INCREMENT,
                                 `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '点赞用户ID',
                                 `comment_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '被点赞的评论ID',
                                 `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
                                 PRIMARY KEY (`id`) USING BTREE,
                                 UNIQUE INDEX `uk_user_comment`(`user_id` ASC, `comment_id` ASC) USING BTREE,
                                 INDEX `fk_like_comment`(`comment_id` ASC) USING BTREE,
                                 CONSTRAINT `fk_like_comment` FOREIGN KEY (`comment_id`) REFERENCES `comment` (`comment_id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                 CONSTRAINT `fk_like_user` FOREIGN KEY (`user_id`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '评论点赞记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of comment_like
-- ----------------------------

-- ----------------------------
-- Table structure for custom_page
-- ----------------------------
DROP TABLE IF EXISTS `custom_page`;
CREATE TABLE `custom_page`  (
                                `id` int NOT NULL AUTO_INCREMENT,
                                `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
                                `page_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '页面名',
                                `page_code` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '页面代码',
                                `alias` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '访问地址',
                                `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '页面创建时间',
                                `status` int NOT NULL COMMENT '页面状态0为删除1为正常',
                                PRIMARY KEY (`id`) USING BTREE,
                                UNIQUE INDEX `alias`(`alias` ASC) USING BTREE COMMENT '页面访问地址',
                                INDEX `uuid`(`uuid` ASC) USING BTREE,
                                CONSTRAINT `fk_custom_page_user_uuid` FOREIGN KEY (`uuid`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of custom_page
-- ----------------------------

-- ----------------------------
-- Table structure for dashboard_menu
-- ----------------------------
DROP TABLE IF EXISTS `dashboard_menu`;
CREATE TABLE `dashboard_menu`  (
                                   `id` int NOT NULL COMMENT '菜单ID',
                                   `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '菜单标题，如“站点设置”',
                                   `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '图标名称',
                                   `link` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '路由链接，父菜单可为空',
                                   `parent_id` int NULL DEFAULT NULL COMMENT '父级菜单ID，NULL表示顶级菜单',
                                   `permission_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '访问此菜单所需的权限码，如 system:edit',
                                   `sort_order` int NULL DEFAULT 0 COMMENT '排序权重，值越小越靠前',
                                   `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
                                   `type` enum('sidebar','quick_action') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'sidebar' COMMENT '菜单类型',
                                   PRIMARY KEY (`id`) USING BTREE,
                                   INDEX `idx_parent_id`(`parent_id` ASC) USING BTREE,
                                   INDEX `idx_link`(`link` ASC) USING BTREE,
                                   INDEX `idx_permission_code`(`permission_code` ASC) USING BTREE,
                                   INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE,
                                   CONSTRAINT `fk_menu_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `dashboard_menu` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
                                   CONSTRAINT `fk_menu_permission_code` FOREIGN KEY (`permission_code`) REFERENCES `permission` (`code`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '仪表盘菜单表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of dashboard_menu
-- ----------------------------
INSERT INTO `dashboard_menu` VALUES (1, '仪表盘', 'dashboard', '/dashboard', NULL, NULL, 10, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (2, '个人中心', 'user', '/dashboard/profile', NULL, NULL, 20, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (3, '内容', 'content', NULL, NULL, NULL, 30, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (5, '设置', 'settings', NULL, NULL, NULL, 50, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (21, '文章', 'article', '/dashboard/articles', 3, 'post:create', 20, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (22, '文章审核', 'review', '/dashboard/articlesreview', 3, 'post:review', 30, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (24, '评论', 'comment', '/dashboard/comments', 3, 'post:review', 40, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (25, '菜单', 'menus', '/dashboard/menus', 3, 'system:edit', 50, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (42, '用户', 'users', '/dashboard/users', 3, 'user:management', 10, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (43, '站点信息', 'info', '/dashboard/settings', 5, 'system:edit', 10, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (44, '主题管理', 'theme', '/dashboard/themes', 5, 'system:edit', 20, '2025-09-24 16:52:43', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (45, '自定义页面', 'page', '/dashboard/custom-pages', 3, 'system:edit', 20, '2025-12-04 21:42:15', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (101, '个人中心', 'user', '/dashboard/profile', NULL, NULL, 10, '2025-09-13 11:12:42', 'quick_action');
INSERT INTO `dashboard_menu` VALUES (103, '创建文章', 'edit', '/dashboard/articles/create', NULL, 'post:create', 20, '2025-09-13 11:12:42', 'quick_action');
INSERT INTO `dashboard_menu` VALUES (104, '用户', 'users', '/dashboard/users', NULL, 'system:edit', 30, '2025-09-13 11:12:42', 'quick_action');
INSERT INTO `dashboard_menu` VALUES (105, '标签管理', 'tag', '/dashboard/tags', 3, 'system:edit', 40, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (106, '分类管理', 'category', '/dashboard/categories', 3, 'system:edit', 40, '2025-09-13 11:12:42', 'sidebar');
INSERT INTO `dashboard_menu` VALUES (107, '友链管理', 'link', '/dashboard/friendlinks', 3, 'system:edit', 45, '2025-12-04 21:42:15', 'sidebar');

-- ----------------------------
-- Table structure for friend_links
-- ----------------------------
DROP TABLE IF EXISTS `friend_links`;
CREATE TABLE `friend_links`  (
                                 `id` int NOT NULL AUTO_INCREMENT,
                                 `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '唯一id',
                                 `site_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '站点名称',
                                 `site_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '站点url',
                                 `site_icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '站点图标url',
                                 `site_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '站点介绍',
                                 `webmaster_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '站长名称',
                                 `contact` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '联系方式',
                                 `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                 `status` int NOT NULL COMMENT '0为删除，1为通过审核，2为待审核',
                                 PRIMARY KEY (`id`) USING BTREE,
                                 UNIQUE INDEX `uuid`(`uuid` ASC) USING BTREE,
                                 UNIQUE INDEX `site_url`(`site_url` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of friend_links
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
                          `sort_order` int NOT NULL COMMENT '菜单的显示顺序',
                          `status` int NOT NULL COMMENT '0为删除、1为正常',
                          PRIMARY KEY (`id`) USING BTREE,
                          UNIQUE INDEX `menus_id`(`menus_id` ASC) USING BTREE,
                          INDEX `menus_user_id`(`user_id` ASC) USING BTREE,
                          CONSTRAINT `menus_user_id` FOREIGN KEY (`user_id`) REFERENCES `user_information` (`uuid`) ON DELETE SET NULL ON UPDATE SET NULL
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of menus
-- ----------------------------
INSERT INTO `menus` VALUES (1, 'menu_f7f08e6b511848c680c98749cc89b073', '075eb86f721743e3940f35869154a140175689381296899805858', '首页', '/', 0, 1);
INSERT INTO `menus` VALUES (2, 'menu_096205a759934193952aef85dfe382fa', '075eb86f721743e3940f35869154a140175689381296899805858', '作者主页', 'https://github.com/lingview', 1, 1);
INSERT INTO `menus` VALUES (3, 'menu_d7f2c129f1df45c4a606bcd69cf02b51', '075eb86f721743e3940f35869154a140175689381296899805858', '项目地址', 'https://github.com/lingview/dim_stack', 2, 1);
INSERT INTO `menus` VALUES (4, 'menu_16404a4412c0463f9d04e5dea10c19bc', '075eb86f721743e3940f35869154a140175689381296899805858', '致谢', '/article/thanks', 3, 1);
INSERT INTO `menus` VALUES (5, 'menu_8d1022c01adf4b8f87bc9debd86f33a5', '075eb86f721743e3940f35869154a140175689381296899805858', '友链', '/friend-links', 4, 1);
INSERT INTO `menus` VALUES (6, 'menu_f71584ff8f574978bf0e66e52bccf2ac', '075eb86f721743e3940f35869154a140175689381296899805858', '关于', '/article/about', 5, 1);

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
                                `site_icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '站点图标',
                                `site_theme` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '站点主题',
                                `expansion_server` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '扩展服务器',
                                `enable_notification` tinyint(1) NULL DEFAULT 0 COMMENT '是否启用通知系统（1：启用，0：禁用）',
                                `smtp_host` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'SMTP服务器地址',
                                `smtp_port` int NULL DEFAULT NULL COMMENT 'SMTP端口',
                                `mail_sender_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '发件人邮箱',
                                `mail_sender_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '系统通知' COMMENT '发件人名称',
                                `mail_username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '邮箱登录账号',
                                `mail_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '邮箱授权码（应加密存储）',
                                `mail_protocol` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'smtp' COMMENT '协议类型：smtp/smtps',
                                `mail_enable_tls` tinyint(1) NULL DEFAULT 1 COMMENT '是否启用TLS',
                                `mail_enable_ssl` tinyint(1) NULL DEFAULT 0 COMMENT '是否启用SSL',
                                `mail_default_encoding` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'UTF-8' COMMENT '编码格式',
                                `icp_record_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'icp备案号',
                                `mps_record_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '公安联网备案号',
                                `enable_register` int NULL DEFAULT NULL COMMENT '是否启用用户注册（1：启用，0：禁用）',
                                PRIMARY KEY (`id`) USING BTREE,
                                INDEX `register_user_permission`(`register_user_permission` ASC) USING BTREE,
                                CONSTRAINT `register_user_permission` FOREIGN KEY (`register_user_permission`) REFERENCES `role` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '站点基础设置表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of site_config
-- ----------------------------
INSERT INTO `site_config` VALUES (1, '次元栈 - Dim Stack', 2, '© 2025 次元栈 - Dim Stack. All rights reserved.', 3, 'https://pan.lingview.xyz/d/%E9%9B%A8%E4%BA%91%E8%8A%82%E7%82%B9/%E5%9B%BE%E5%BA%93/%E5%A4%A9%E4%BE%9D/a2c28b53fdc12fde51bf23928127066f.jpg?sign=0P0lUp19dTUdaMQ_WHFjknnpVGKXSsggQbKIi_mgtGM=:0', '欢迎来到瓦纳海姆星', '探索洛天依和Vsinger家族的音乐之旅', 'https://pan.lingview.xyz/d/%E9%9B%A8%E4%BA%91%E8%8A%82%E7%82%B9/%E5%9B%BE%E5%BA%93/%E5%A4%A9%E4%BE%9D/Image_1721230292906.png?sign=JU30z6z_RsZ3Vv7HB_5D3msYRneiga5NLjhN3EpL-3w=:0', 'default', 'https://dimstackrepo.apilinks.cn/themes.json', 0, '', NULL, '', '系统通知', '', NULL, 'smtp', 0, 1, 'UTF-8', '', '', 1);

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
                                     UNIQUE INDEX `username`(`username` ASC) USING BTREE,
                                     INDEX `idx_role_id`(`role_id` ASC) USING BTREE,
                                     CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_information
-- ----------------------------
INSERT INTO `user_information` VALUES (1, '075eb86f721743e3940f35869154a140175689381296899805858', 'admin', '/upload/admin/avatar/avatar-3e04e348-8bef-4abe-a164-572e0421f17e-1757579183.jpeg', NULL, 'official@dimstack.com', NULL, '$2a$10$hNfMxBf3egQkomuMql9LDeMJb2AC9IXkp904GgqX6DAxc8u9i1aAm', NULL, 4, '2025-09-03 18:03:33', 1);

SET FOREIGN_KEY_CHECKS = 1;
