# 次元栈 · Dim Stack
> 基于 Spring Boot + React 的现代化个人博客系统
>

<!-- 这是一张图片，ocr 内容为： -->
![](https://img.shields.io/badge/Spring_Boot-4.0.2-green.svg)

<!-- 这是一张图片，ocr 内容为： -->
![](https://img.shields.io/badge/React-19.1.1-%2361DAFB.svg)

<!-- 这是一张图片，ocr 内容为： -->
![](https://img.shields.io/badge/Node.js-22.16.0-43853D.svg)

<!-- 这是一张图片，ocr 内容为： -->
![](https://img.shields.io/badge/Database-MySQL-4479A1.svg)

<!-- 这是一张图片，ocr 内容为： -->
![](https://img.shields.io/badge/Database-Redis-DC382D.svg)



---

## 🌟 项目简介
**官方qq群** ：577040366

**次元栈** 基于SpringBoot4的全新博客系统

平台核心功能：

+ 📝 文章发布与内容管理（CMS）
+ 💬 用户互动：评论、点赞、收藏
+ 🔖 标签分类：支持跨圈层内容组织
+ 👥 用户系统：注册、登录、个人主页、权限管理、文章发布管理系统、RBAC权限管理......
+ 🔍 内容搜索与推荐
+ 📱 响应式前端，支持移动端浏览
+ 📦 支持首页、文章页服务端渲染

---

## 🛠 技术栈
| 层级 | 技术选型                                                   |
| --- |--------------------------------------------------------|
| **后端** | Java 17+, Spring Boot 4, Mybatis, MySQL, Redis, Cookie |
| **前端** | React 19, JavaScript, Vite, Axios, Tailwind CSS        |
| **构建** | Maven (后端), npm/pnpm (前端)                              |
| **部署** | Docker, Nginx, Linux, Windows                          |


---

## 半自动部署（推荐）
> 环境要求（给出版本为可用版本，其他版本请自行测试）
>
> OpenJDK版本：17+
>
> Redis版本：5+
>
> mysql版本：8+
>
> 演示站：[https://apilinks.cn/](https://apilinks.cn/)
>

解压下载的压缩包  
然后进入到目录下执行命令：

```bash
java -jar dimstack-1.0-SNAPSHOT.jar
```

运行后找到终端输出的地址（端口号是随机的）在浏览器打开
进入站点初始化界面，格式如下（域名端口改为自己的，在终端或日志中查看）
```bash
http://localhost:8080/init/setup
```

<!-- 这是一张图片，ocr 内容为： -->
![](img.png)
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1768055648141-0931e9ce-f844-400a-acf7-500930bb5ecf.png)

按照初始化向导的提示填写：管理员用户名、密码、站点运行端口、日志级别、mysql信息以及redis信息等（默认信息不懂的话不要动）

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1768055710347-c57a1d17-5a52-4b33-b435-50096b9dcb98.png)

填写完后点击确认（系统会自动按照填写的信息完成初始化，导入sql、配置文件生成等），出现下面界面即为成功，重启即可

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1768055855648-4337108c-4ef7-41cc-981a-f7c7675f1d3e.png)

[部署视频](./video/部署教程.mp4)

```
注：如果是如下版本的升级需要手动执行数据库升级脚本（如果数据库不是默认名请将USE dim_stack;修改为对应的数据库名）
v54->v55+
v64->v65+
v77->v84+
上述版本请到数据库更新脚本目录中下载对应的升级脚本
注：mysql5的兼容更新脚本只支持到5.7，其他版本请自行处理（建议数据库尽快升级至mysql8+）（v82+版本已逐步放弃mysql5.x支持，所以mysql5版本的系统请不要升级）
```


### 3.安装Redis
下载5+版本的redis双击redis-server启动即可，linux系统无需多言hhh

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757926976965-b1e553e4-fe94-441e-8954-a9fdd6c73d33.png)

### 4.启动系统
```yaml
java -jar dim_stack.jar
```

## SEO相关
> 文章内容页已支持SSR并且适配主流搜索引擎，使用动态生成的 robots.txt 以及 sitemap.xml
>

### 1. 首页、文章页 SSR
+ 针对搜索引擎 User-Agent 自动返回服务器渲染的 HTML。
+ SSR 页面包含：
  - `<title>`：文章标题
  - `<meta name="description">`：文章摘要
  - `<meta name="keywords">`：文章标签
  - 文章内容和发布时间
  - ......
+ 普通用户访问则返回 SPA 首页，保持 React 的交互体验。
+ 支持主流搜索引擎爬虫：
  - Googlebot、Bingbot、Baiduspider、DuckDuckBot、Sogou、360Spider 等


## 贡献者
感谢所有参与本项目的贡献者（按字母顺序排列）：
- [@bytegeek](https://github.com/xrb114) - 渗透测试
- [@dear-sk](https://github.com/dear-sk) - 系统测试
- [@Denghls](https://github.com/Denghls) - 需求分析
- [@hanbingniao](https://github.com/hanbingniao) - 系统测试
- [@kongcangyimama](https://github.com/kongcangyimama) - 主题设计
- [@lingview](https://github.com/lingview) - 系统开发
- [@q1uf3ng](https://github.com/q1uf3ng) - 渗透测试
- [@YeFeng0712](https://github.com/YeFeng0712) - 需求分析
- [@yukifia](https://github.com/yukifia) - 需求分析


---

### 💡 特别感谢
+ 感谢所有为本项目贡献代码、提出问题和提供反馈的开发者。
+ 感谢开源社区持续的支持与贡献。

---

如果你在本项目中做出了贡献，请提交 PR 将你的名字加入到致谢名单中！

