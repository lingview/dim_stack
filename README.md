# 次元栈论坛 · Dim Stack
> 基于 Spring Boot + React 的现代化论坛 CMS 系统
>

<!-- 这是一张图片，ocr 内容为： -->
![](https://img.shields.io/badge/Spring_Boot-3.5-green.svg)
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
**次元栈** 一个个人练手项目 ps:不要抱太大希望

平台核心功能：

+ 📝 文章发布与内容管理（CMS）
+ 💬 用户互动：评论、点赞、收藏
+ 🔖 标签分类：支持跨圈层内容组织
+ 👥 用户系统：注册、登录、个人主页、权限管理、文章发布管理系统、RBAC权限管理......
+ 🔍 内容搜索与推荐
+ 📱 响应式前端，支持移动端浏览
+ 📦 支持文章页服务端渲染

---

## 🛠 技术栈
| 层级 | 技术选型 |
| --- | --- |
| **后端** | Java 17, Spring Boot 3.5, Mybatis, MySQL, Redis, Cookie |
| **前端** | React 19, JavaScript, Vite, Axios, Tailwind CSS |
| **构建** | Maven (后端), npm/pnpm (前端) |
| **部署** | Docker, Nginx, Linux, Windows |


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

<!-- 这是一张图片，ocr 内容为： -->
![](img.png)<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1768055648141-0931e9ce-f844-400a-acf7-500930bb5ecf.png)

按照向导的提示填写信息（默认信息不懂的话不要动）

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1768055710347-c57a1d17-5a52-4b33-b435-50096b9dcb98.png)

填写完后点击确认，出现下面界面即为成功，重启即可

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1768055855648-4337108c-4ef7-41cc-981a-f7c7675f1d3e.png)

## 全手动部署
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



### 1、创建配置文件（application.yml）
> 将Mysql以及Redis密码改为自己的，可以适当修改日志级别
>
> 将配置文件放到jar包同级目录下的config文件夹
>

```yaml
spring:
  jackson:
    time-zone: GMT+8
    date-format: yyyy-MM-dd HH:mm:ss

  session:
    redis:
      namespace: "dimstack:session"
      flush-mode: on_save
      save-mode: always

  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/dim_stack?characterEncoding=utf-8&nullCatalogMeansCurrent=true&serverTimezone=GMT%2B8&useSSL=false&allowPublicKeyRetrieval=true&useAffectedRows=true
    username: root
    password: "ling060318"
    type: com.alibaba.druid.pool.DruidDataSource

    druid:
      initial-size: 3
      min-idle: 3
      max-active: 20
      max-wait: 60000
      validation-query: SELECT 1
      test-while-idle: true
      test-on-borrow: false
      test-on-return: false


  servlet:
    multipart:
      enabled: true
      max-file-size: 100MB
      max-request-size: 100MB

  data:
    redis:
      host: 127.0.0.1
      port: 6379
      password: ""
      timeout: 5s
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0
          max-wait: -1ms

  devtools:
    restart:
      enabled: false
    livereload:
      enabled: false




  thymeleaf:
    cache: true
    enabled: true
    prefix: classpath:/templates/
    suffix: .html
    encoding: UTF-8
    servlet:
      content-type: text/html

  profiles:
    active: dev

springdoc:
  api-docs:
    enabled: true
    path: /v3/api-docs
  swagger-ui:
    enabled: true
    path: /swagger-ui/index.html
    cors:
      enabled: true

project:
  version: ${project.version}
  build-date: ${maven.build.timestamp}

management:
  endpoints:
    enabled-by-default: false
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      enabled: true
      show-details: always
    info:
      enabled: true
    metrics:
      enabled: false
    shutdown:
      enabled: false

mybatis:
  type-aliases-package: xyz.lingview.dimstack.**.domain
  mapper-locations: classpath*:mapper/*Mapper.xml
  config-location: classpath:mybatis-config.xml

server:
  port: 2222
  servlet:
    context-path: /
  tomcat:
    uri-encoding: UTF-8
    max-threads: 200
    min-spare-threads: 10
    protocol-header: X-Forwarded-Proto
    remote-ip-header: X-Forwarded-For


  forward-headers-strategy: native

logging:
  level:
    xyz.lingview.dimstack: info
    org.springframework: warn
    org.springframework.security: info
    org.springframework.session: info
    org.springframework.web: info

file:
  # 文件存储目录
  data-root: .
  upload-dir: upload
  # 日志存储目录
  log-root: .

app:
  theme:
    active-theme: default
    themes-path: themes

```

### 2.Nginx反向代理配置文件
```bash
server {
    listen 80;
    listen 443 ssl;
    listen 443 quic;
    http2 on;
    server_name www.apilinks.cn apilinks.cn;

    include /www/server/panel/vhost/nginx/well-known/dimstack.conf;

    set $isRedcert 1;
    if ($server_port != 443) {
        set $isRedcert 2;
    }
    if ( $uri ~ /\.well-known/ ) {
        set $isRedcert 1;
    }
    if ($isRedcert != 1) {
        return 301 https://$host$request_uri;
    }

    ssl_certificate    /www/server/panel/vhost/cert/dimstack/fullchain.pem;
    ssl_certificate_key    /www/server/panel/vhost/cert/dimstack/privkey.pem;
    ssl_protocols TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_ciphers EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_tickets on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header Alt-Svc 'quic=":443"; h3=":443"; h3-29=":443"; h3-27=":443";h3-25=":443"; h3-T050=":443"; h3-Q050=":443";h3-Q049=":443";h3-Q048=":443"; h3-Q046=":443"; h3-Q043=":443"' always;
    error_page 497  https://$host$request_uri;


    location / {
        proxy_pass http://127.0.0.1:2222;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_connect_timeout 30s;
        proxy_read_timeout 86400s;
        proxy_send_timeout 30s;
    }

    access_log  /www/wwwlogs/dimstack.log;
    error_log   /www/wwwlogs/dimstack.error.log;
}
```

### 2.创建数据库并导入数据
> 需要手动将dim_stack.sql这个文件导入创建的数据库
>



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

### 1. 文章页 SSR
+ 针对搜索引擎 User-Agent 自动返回服务器渲染的 HTML。
+ SSR 页面包含：
  - `<title>`：文章标题
  - `<meta name="description">`：文章摘要
  - `<meta name="keywords">`：文章标签
  - 文章内容和发布时间
+ 普通用户访问则返回 SPA 首页，保持 React 的交互体验。
+ 支持主流搜索引擎爬虫：
  - Googlebot、Bingbot、Baiduspider、DuckDuckBot、Sogou、360Spider 等



## 主要界面展示
### 前台
> 白天模式
<!-- 这是一张图片，ocr 内容为： -->
![](./images/index_light.png)<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1759940349525-80d15679-510f-43b8-b493-48e2a0fe572c.png)
>

> 夜晚模式
<!-- 这是一张图片，ocr 内容为： -->
![](./images/index_dark.png)<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1759940370887-4cd7478c-47db-4b31-b606-c6bc978c12c8.png)
>

> 密码文章
<!-- 这是一张图片，ocr 内容为： -->
![](./images/passwordarticle.png)<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822301247-6ed5148f-11da-40bc-b886-208a72906399.png)
>

> 文章阅读器
<!-- 这是一张图片，ocr 内容为： -->
![](./images/articleread.png)<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1759940413055-e4cecb63-e558-427e-b125-a2c137e0886a.png)
>

> 评论区
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1759940440917-ad75c96e-1b4e-4c66-a1eb-90ed60732c98.png)
>



> 文章搜索<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822460232-b2215a76-2642-4f14-ad76-8e6b440c9eb9.png)
>

### 后台
> 控制台主页
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822521982-5c5cdb5a-19c3-4248-bf08-1ae0063def7e.png)
>

> 个人中心
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822571122-4e0f17a5-4667-4b31-9dba-7644484bf3bc.png)
>

> 用户管理  
用户权限使用RBAC，可以在此功能区切换用户角色
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822596285-e4396bad-c0ef-4a85-ace3-ac0ea02e12b4.png)
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822744044-2fb46712-3c84-41cc-a0d2-c989e114f000.png)
>

> 文章管理
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822625207-b9adee65-3821-4659-8cb1-e856bac87bf4.png)
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822791757-06db8178-7647-4af9-9503-73e512db2e1d.png)
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822830413-77ff3f88-d7c6-4a5a-88e7-01eba2a18355.png)
>

> 文章审核
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822652370-ff4f7de4-6b6b-48c3-a3dd-4d435e9b604a.png)
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822674493-c6780c34-4301-4cd5-9ed2-34ac5f216141.png)
>

> 评论管理
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822866892-d945f5f9-43f8-488b-9ee9-0b973ec000d7.png)
>

> 标签&分类管理
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822885790-90de2eaf-1a7e-47b7-b586-cc3bd486ae92.png)
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822911681-a0c388a8-24f6-4c2c-9efb-cdbedff5eba3.png)
>

> 菜单编辑
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757822935393-6abb27ea-387a-4217-9abb-343aecc14100.png)
>

> 站点信息设置
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1757823311575-bc09aad5-f234-4242-898a-6da96f72e5cf.png)
>

> 主题设置
>
> <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/53238627/1759940311884-7019af97-a5d2-4ad0-9ba7-9c937a03dbd7.png)
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

## 功能详细列表
### 2025-12-04
+ 添加友链模块
+ 允许管理员控制是否开放用户注册

### 2025-11-30
+ 增加ICP备案号以及公安联网备案的配置和显示

### 2025-11-16
+ 增加文章点赞记录表
+ 加入测试阶段的SSR以优化系统的SEO

### 2025-11-12
+ 允许在文章中添加压缩文件
+ 增加文件访问控制器

### 2025-10-13
+ 登录、注册、文章信息变更、评论区变更接入通知系统

### 2025-10-12
+ 设置站点基本信息缓存到Redis降低MySQL压力
+ 初步增加邮件发送组件

### 2025-10-10
+ 增加系统交互式配置工具

### 2025-10-09
+ 增加数据库自动初始化组件
+ 完善自动构建配置
+ 文章阅读器增加文章分类显示，并且优化标签显示

### 2025-10-08
+ 文章阅读器增加返回顶部功能
+ 文章阅读器增加文章目录组件

### 2025-09-28
+ 文章阅读器增加标签侧边栏
+ 增加文章卡片点击面积
+ 允许根据文章标签筛选文章
+ 允许更改系统扩展服务地址
+ 首页文章卡片加入文章标签展示

### 2025-09-25
+ 允许文章选择多个标签

### 2025-09-24
+ 评论区支持显示是否已点赞
+ 扩展服务增加权限系统

### 2025-09-23
+ 实现主题功能
+ 初步增加扩展服务器组件

### 2025-09-16
+ 允许用户关闭首页文章卡片的图片，并且加入文章卡片鼠标悬浮动画

### 2025-09-14
+ 增加全部文章审核功能
+ 允许用户关闭文章密码，允许后台修改自己密码
+ 增加站点图标设置

### 2025-09-13
+ 增加文章搜索以及热门文章详细信息展示
+ 增加标签和分类管理
+ 支持后台快捷卡片跳转到指定功能点
+ 后台菜单从后端获取
+ 增加默认数据

### 2025-09-12
+ 添加站点数据统计

### 2025-09-11
+ 增加站点信息修改功能
+ 增加用户管理功能
+ 增加目录编辑功能，并增加系统修改权限
+ 实现文章分类选择

### 2025-09-10
+ 增加文章审核功能
+ 增加评论管理组件

### 2025-09-09
+ 增加个人信息编辑功能
+ 增加用户头像功能

### 2025-09-08
+ 初步实现评论区功能

### 2025-09-07
+ 完成评论区表结构设计
+ 增加文章管理功能

### 2025-09-06
+ 首页站点名称从后端获取
+ 首页版权信息从后端获取
+ 实现热门文章功能
+ 实现文章阅读量更新
+ 增加文章别名唯一检测

### 2025-09-05
+ 优化文章编辑器在暗色模式下工具栏显示效果

### 2025-09-04
+ 增加登录状态检测
+ 增加cookie持久化配置
+ 实现文章阅读功能
+ 实现密码文章功能

### 2025-09-03
+ 实现创建文章时文章摘要设置
+ 文章表增加摘要字段
+ 前后端均加入密码文章支持
+ 系统配置表增加文章默认状态字段

### 2025-09-01
+ 文章上传功能完成
+ 增加文章标签表以及文章分类表
+ 增加文章分类和文章标签获取

### 2025-08-31
+ 完成附件上传组件
+ 完善数据库表结构

### 2025-08-28
+ 完成管理后台基本前端界面
+ 添加文章编辑器组件

### 2025-08-27
+ 基本完成系统权限框架
+ 完成文件上传方法后端（支持分片上传）
+ 增加markdown转docx工具
+ 增加文件扩展名获取工具

### 2025-08-26
+ 实现登录注册接口以及界面
+ 添加简单的XSS、SQL过滤器

### 2025-08-25
+ 初始化后端SpringBoot模板

### 2025-08-24
+ 系统首页基本完成
+ 加入暗色模式适配
+ 适配移动端

---

### 💡 特别感谢
+ 感谢所有为本项目贡献代码、提出问题和提供反馈的开发者。
+ 感谢开源社区持续的支持与贡献。

---

💡 如果你在本项目中做出了贡献，请提交 PR 将你的名字加入到致谢名单中！

