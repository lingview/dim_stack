# 次元栈论坛 · Dim Stack
> 一个为虚拟歌手（Vsinger）、Minecraft 玩家与计算机爱好者打造的多元兴趣内容社区  
基于 Spring Boot + React 的现代化论坛 CMS 系统
>

![](https://img.shields.io/badge/Spring_Boot-3.5-green.svg)  
![](https://img.shields.io/badge/React-19.1.1-%2361DAFB.svg)  
![](https://img.shields.io/badge/Node.js-22.16.0-43853D.svg)  
![](https://img.shields.io/badge/Database-MySQL-4479A1.svg)  
![](https://img.shields.io/badge/Database-Redis-DC382D.svg)



---

## 🌟 项目简介
**次元栈** 是一个面向多元兴趣群体的内容社区平台，致力于为 **Vsinger 爱好者**、**Minecraft 创作者** 与 **计算机技术爱好者** 提供一个自由表达、知识共享与创作沉淀的空间。

平台核心功能：

+ 📝 文章发布与内容管理（CMS）
+ 💬 用户互动：评论、点赞、收藏
+ 🔖 标签分类：支持跨圈层内容组织（如 #洛天依、#乐正绫、#星尘、#红石电路、#Java）
+ 👥 用户系统：注册、登录、个人主页
+ 🔍 内容搜索与推荐
+ 📱 响应式前端，支持移动端浏览

---

## 🛠 技术栈
| 层级 | 技术选型 |
| --- | --- |
| **后端** | Java 17, Spring Boot 3.5, Mybatis, MySQL, Redis, Cookie |
| **前端** | React 19, JavaScript, Vite, Axios, Tailwind CSS |
| **构建** | Maven (后端), npm/pnpm (前端) |
| **部署** | Docker, Nginx, Linux, Windows |


---

## 主要界面展示
> 白天模式  
![](./images/index_light.png)![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822244480-fa9faa5f-4964-4ecd-bf60-79452ccd765c.png)
>

> 夜晚模式  
![](./images/index_dark.png)![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822267974-e0c9ea50-99ca-4d06-a913-89001e392ccc.png)
>

> 密码文章  
![](./images/passwordarticle.png)![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822301247-6ed5148f-11da-40bc-b886-208a72906399.png)
>

> 文章阅读器  
![](./images/articleread.png)![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822325554-566b8f14-1a75-44f8-b4b5-3e579503d9a1.png)
>

> 评论区  
![](./images/comment.png)![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822415639-6bced7dc-279d-4f5b-a480-fa86c50b5ffa.png)
>



> 文章搜索![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822460232-b2215a76-2642-4f14-ad76-8e6b440c9eb9.png)
>

> 控制台主页
>
> ![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822521982-5c5cdb5a-19c3-4248-bf08-1ae0063def7e.png)
>

> 个人中心
>
> ![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822571122-4e0f17a5-4667-4b31-9dba-7644484bf3bc.png)
>

> 用户管理
>
> ![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822596285-e4396bad-c0ef-4a85-ace3-ac0ea02e12b4.png)
>
> ![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822744044-2fb46712-3c84-41cc-a0d2-c989e114f000.png)
>

> 文章管理
>
> ![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822625207-b9adee65-3821-4659-8cb1-e856bac87bf4.png)
>
> ![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822791757-06db8178-7647-4af9-9503-73e512db2e1d.png)
>
> ![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822830413-77ff3f88-d7c6-4a5a-88e7-01eba2a18355.png)
>

> 文章审核
>
> ![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822652370-ff4f7de4-6b6b-48c3-a3dd-4d435e9b604a.png)
>
> ![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822674493-c6780c34-4301-4cd5-9ed2-34ac5f216141.png)
>

> 评论管理
>
> ![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822866892-d945f5f9-43f8-488b-9ee9-0b973ec000d7.png)
>

> 标签&分类管理
>
> ![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822885790-90de2eaf-1a7e-47b7-b586-cc3bd486ae92.png)
>
> ![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822911681-a0c388a8-24f6-4c2c-9efb-cdbedff5eba3.png)
>

> 菜单编辑
>
> ![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822935393-6abb27ea-387a-4217-9abb-343aecc14100.png)
>

> 站点信息设置
>
> ![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757823311575-bc09aad5-f234-4242-898a-6da96f72e5cf.png)
>



## 致谢
在此，我们衷心感谢以下为本项目提供帮助、支持或灵感的个人和组织：

### 贡献者
感谢所有参与本项目的贡献者（按字母顺序排列）：

+ [@bytegeek](https://github.com/xrb114) - 渗透测试
+ [@lingview](https://github.com/lingview) - 系统开发
+ [@q1uf3ng](https://github.com/q1uf3ng) - 渗透测试



---

> 感谢以下框架、库和工具对本项目的支持 🙏
>

### 后端依赖（Java / Spring Boot）
#### 🌱 Spring 生态
+ [Spring Boot Starter](https://spring.io/projects/spring-boot)
+ Spring Boot Starter Web
+ Spring Boot Starter AOP
+ Spring Boot Starter Mail
+ Spring Boot Starter WebSocket
+ Spring Boot Starter Data Redis
+ Spring Boot Starter Actuator
+ [Spring Session Data Redis](https://spring.io/projects/spring-session)
+ Spring Context Support
+ Spring Web

#### 💾 数据库与持久化
+ [MyBatis Spring Boot Starter](https://github.com/mybatis/spring-boot-starter)
+ [MySQL Connector/J](https://dev.mysql.com/downloads/connector/j/)
+ [Druid](https://github.com/alibaba/druid)

#### 🛠 工具类库
+ [Apache Commons IO](https://commons.apache.org/proper/commons-io/)
+ [Apache Commons Lang3](https://commons.apache.org/proper/commons-lang/)
+ [Lombok](https://projectlombok.org/)
+ [Hutool](https://hutool.cn/)

#### 📄 文档与格式解析
+ [Jsoup](https://jsoup.org/)
+ [Apache POI](https://poi.apache.org/)
+ [Flexmark](https://github.com/vsch/flexmark-java)

#### 🔐 安全与加密
+ [jBCrypt](https://www.mindrot.org/projects/jBCrypt/)

#### 🔍 JSON 处理
+ [Jackson Databind](https://github.com/FasterXML/jackson-databind)
+ [Fastjson](https://github.com/alibaba/fastjson)
+ [Gson](https://github.com/google/gson)

#### ⚙️ 系统与代码分析
+ [OSHI](https://github.com/oshi/oshi)
+ [JavaParser](https://javaparser.org/)
+ [CFR Decompiler](https://www.benf.org/other/cfr/)

#### 🌐 其他
+ [juniversalchardet](https://code.google.com/archive/p/juniversalchardet/)
+ Spring Boot Starter Test

---

### 前端依赖（React / Vite）
#### ⚛️ 核心框架
+ [React](https://react.dev/)
+ [React DOM](https://react.dev/)
+ [React Router DOM](https://reactrouter.com/)

#### 🎨 UI 与动画
+ [Framer Motion](https://www.framer.com/motion/)
+ [Lucide React](https://lucide.dev/)
+ [React Favicon](https://github.com/oflisback/react-favicon)

#### 📝 Markdown 与富文本
+ [React Markdown](https://github.com/remarkjs/react-markdown)
+ [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
+ [Remark GFM](https://github.com/remarkjs/remark-gfm)
+ [Remark Parse](https://github.com/remarkjs/remark/tree/main/packages/remark-parse)
+ [Remark Rehype](https://github.com/remarkjs/remark-rehype)
+ [Rehype Highlight](https://github.com/rehypejs/rehype-highlight)
+ [Rehype Raw](https://github.com/rehypejs/rehype-raw)
+ [Rehype Sanitize](https://github.com/rehypejs/rehype-sanitize)
+ [Rehype Stringify](https://github.com/rehypejs/rehype/blob/main/packages/rehype-stringify)
+ [Unified](https://unifiedjs.com/)

#### 🌐 网络请求与安全
+ [Axios](https://axios-http.com/)
+ [DOMPurify](https://github.com/cure53/DOMPurify)

#### 🛠 构建与样式
+ [Vite](https://vitejs.dev/)
+ [Tailwind CSS](https://tailwindcss.com/)
+ [PostCSS](https://postcss.org/)
+ [Autoprefixer](https://github.com/postcss/autoprefixer)
+ @tailwindcss/vite
+ @tailwindcss/postcss

---

### 💡 特别感谢
+ 感谢所有为本项目贡献代码、提出问题和提供反馈的开发者。
+ 感谢开源社区持续的支持与贡献。

---

💡 如果你在本项目中做出了贡献，请提交 PR 将你的名字加入到致谢名单中！

