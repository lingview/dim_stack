# 次元栈 · Dim Stack

> 一个简单且易于使用的个人博客系统

![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.6-green.svg)

![React](https://img.shields.io/badge/React-19.1.1-%2361DAFB.svg)

![Node.js](https://img.shields.io/badge/Node.js-22.16.0-43853D.svg)

![Database](https://img.shields.io/badge/Database-MySQL-4479A1.svg)

![Database](https://img.shields.io/badge/Database-Redis-DC382D.svg)

---

## 🌟 项目简介

**次元栈** 是基于 Spring Boot 4 全新构建的个人博客系统。

**官方 QQ 群**：577040366（群内可体验预览版）

### 核心功能

- 📝 文章内容管理（CMS）
- 💬 用户互动：评论、点赞
- 🔖 标签分类：支持跨圈层内容组织
- 👥 用户系统：个人主页、文章发布管理、完整 RBAC 权限系统
- 📱 响应式前端，支持移动端浏览
- 📦 支持首页、文章页服务端渲染（SSR）
- 🤖 大模型文章审核与内容生成
- 🖼️ 智能图片压缩
- 🔍 SEO 优化：动态 Sitemap、Robots、搜索引擎友好

---

## 🛠 技术栈

| 层级 | 技术选型 |
| --- | --- |
| **后端** | Java 17+，Spring Boot 4，MySQL 5.7+，Redis |
| **前端** | React 19，Vite，Tailwind CSS v4 |
| **构建** | Maven（后端），npm（前端） |
| **部署** | Docker，Linux，Windows |

---

## 快速开始

### 运行要求

- JDK 17+（推荐 21+）
- MySQL 5.7+
- Redis 5+（可选）

### 启动步骤

1. 运行 jar 包：
   ```bash
   java -jar dimstack-1.0-SNAPSHOT.jar
   ```
2. 浏览器访问终端输出的地址，进入初始化向导
3. 填写配置完成后重启服务

详细部署教程请查看：[部署文档](docs/deployment.md)

---

## 文档导航

### 系统部署&构建

- [部署&构建](docs/deployment.md)

### 功能说明

- [大模型审核与生成](docs/features/llm_generation_and_review.md)
- [智能图片压缩](docs/features/image-compression.md)
- [外部资源本地化](docs/features/external-resources.md)
- [代码注入（自定义 Head/Footer）](docs/features/code-injection.md)
- [SEO 优化与大模型读取](docs/features/seo.md)
- [评论区功能](docs/features/comments.md)
- [访问控制Key&Agent调用说明](docs/features/key.md)

### 架构说明

- [系统启动流程](docs/architecture/startup-flow.md)
- [缓存模式](docs/architecture/cache-mode.md)

### 主题
- [面向主题开发者接口文档](docs/themes/themes-frontend-routing-guide.md)

### 老版本迁移
- [老版本升级说明](docs/legacy.md)

---

### 💡 特别感谢

感谢所有为本项目贡献代码、提出问题和提供反馈的开发者。  
感谢开源社区持续的支持与贡献。

如果你在本项目中做出了贡献，请提交 PR 将你的名字加入到致谢名单中！
