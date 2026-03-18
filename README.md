# 次元栈 · Dim Stack
> 基于 Spring Boot + React 的现代化个人博客系统
>

![](https://img.shields.io/badge/Spring_Boot-4.0.2-green.svg)

![](https://img.shields.io/badge/React-19.1.1-%2361DAFB.svg)

![](https://img.shields.io/badge/Node.js-22.16.0-43853D.svg)

![](https://img.shields.io/badge/Database-MySQL-4479A1.svg)

![](https://img.shields.io/badge/Database-Redis-DC382D.svg)



---

## 🌟 项目简介
**官方qq群** ：577040366

**次元栈** 基于SpringBoot4的全新博客系统

平台核心功能：

+ 📝 文章发布与内容管理（CMS）
+ 💬 用户互动：评论、点赞
+ 🔖 标签分类：支持跨圈层内容组织
+ 👥 用户系统：个人主页、文章发布管理系统、RBAC权限系统......
+ 📱 响应式前端，支持移动端浏览
+ 📦 支持首页、文章页服务端渲染
+ ......

---

## 🛠 技术栈
| 层级 | 技术选型 |
| --- | --- |
| **后端** | Java 17+，Spring Boot 4，MySQL5.7+，Redis |
| **前端** | React 19，Vite，Tailwind CSS |
| **构建** | Maven (后端)，npm(前端) |
| **部署** | Docker，Linux，Windows |


---



## 宝塔面板部署
请移步b站查看部署视频

[https://www.bilibili.com/video/BV1qncgzkEHk/](https://www.bilibili.com/video/BV1qncgzkEHk/)



## Linux部署
> 环境要求（给出版本为可用版本，其他版本请自行测试）
>
> OpenJDK版本：17+
>
> Redis版本：5+（可选）
>
> mysql版本：5.7+
>
> 演示站：[https://apilinks.cn/](https://apilinks.cn/)
>



### 初始化
解压下载的压缩包  
然后进入到目录下执行命令：

注："--server.port=2223"选项为可选（用于强制指定服务运行端口）

```bash
java -jar dimstack-1.0-SNAPSHOT.jar --server.port=2223
```

运行后找到终端输出的地址（如不指定--server.port=2223端口号是随机的）在浏览器打开  
进入站点初始化界面，格式如下（域名端口改为自己的，在终端或日志中查看）

```bash
http://localhost:2223/init/setup
```

![](img.png)![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1771939967216-cf2e1778-f2b1-402a-9770-9645247e35ec.png)



按照初始化向导的提示填写：管理员用户名、密码、站点运行端口、日志级别、mysql信息以及redis信息等（默认信息不懂的话不要动）

![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1771939997662-94df1978-192b-4ac6-8193-6a15787adb98.png)

填写完后点击确认（系统会自动按照填写的信息完成初始化，导入sql、配置文件生成等），出现下面界面即为成功，重启即可

![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1768055855648-4337108c-4ef7-41cc-981a-f7c7675f1d3e.png)



### 启动测试
再次运行系统

```bash
java -jar dimstack-1.0-SNAPSHOT.jar
```

运行后能看到主页正常加载即为成功

![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1771940913049-420a6404-abee-4d66-9e09-612db7affbd5.png)

### systemd自启

#### 创建服务文件
```bash
sudo vim /etc/systemd/system/dimstack.service
```

#### 写入下面内容（请根据自己服务器情况修改）
```bash
[Unit]
Description=Dim Stack Forum Backend Service
After=network.target mysql.service redis.service
Wants=mysql.service redis.service

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/root/dimstack

Environment="JAVA_OPTS=-server -Xms512m -Xmx1g -XX:+UseG1GC -XX:+UseStringDeduplication -Dfile.encoding=UTF-8"

ExecStart=/bin/sh -c 'exec java $JAVA_OPTS -jar dimstack-1.0-SNAPSHOT.jar'

SuccessExitStatus=143

Restart=always
RestartSec=15

StartLimitInterval=600s
StartLimitBurst=5

ProtectSystem=full
# 如果需要访问用户目录下的文件，请改为"ProtectHome=false"
ProtectHome=true
PrivateTmp=true
PrivateDevices=true
NoNewPrivileges=true
RestrictSUIDSGID=true   
RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6

OOMPolicy=continue
LimitNOFILE=65535

StandardOutput=journal
StandardError=journal
SyslogIdentifier=dim_stack

[Install]
WantedBy=multi-user.target
```

![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1771941575477-4a3a488d-95fc-4d9e-a43d-a0c13b9efa02.png)

#### 重载systemd配置
```bash
systemctl daemon-reload 
```

![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1771941635847-feeaa633-f9ce-4413-b8cc-e28263106eb8.png)

#### 启动服务
```bash
sudo systemctl start dimstack
```

![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1771943203827-d4fa1370-22d1-41ed-a188-ee2a428815fa.png)

#### 检查状态
```bash
sudo systemctl status dimstack
```

![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1771943255079-76fd2faa-02f6-406a-8eba-8cd0f521c9fc.png)

#### 设置开机自启
![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1771943292424-f8aa57ab-aca6-44e3-b24d-fb672406045e.png)

## 老版本相关
注：v84以下的版本没有一键更新系统，所以需要手动完整数据库更新

### 数据库迁移
```plain
注：如果是如下版本的升级需要手动执行数据库升级脚本（如果数据库不是默认名请将USE dim_stack;修改为对应的数据库名）
v54->v55+
v64->v65+
v77->v84+
上述版本请到数据库更新脚本目录中下载对应的升级脚本
注：mysql5的兼容更新脚本只支持到5.7，其他版本请自行处理（建议数据库尽快升级至mysql8+）（v82+版本已逐步放弃mysql5.x支持，所以mysql5版本的系统请不要升级）
```

## SEO相关
> 文章内容页已支持SSR并且适配主流搜索引擎，使用动态生成的 robots.txt 以及 sitemap.xml
>

### 首页、文章页 SSR
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

### SEO优化
<font style="color:rgba(6, 10, 38, 0.7) !important;">支持动态生成 Sitemap 和 Robots.txt，智能处理反向代理头</font>

针对Google、Bing等主流搜索引擎的爬虫进行了独立优化（未覆盖百度，百度爬虫仅能获取基础信息）

![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1771940427421-d51eba44-e781-43f6-9359-6dd69eec331a.png)

### 大模型读取
文章内容可以被大部分网页AI直接读取（密码文章无法读取）

![](https://cdn.nlark.com/yuque/0/2026/png/53238627/1771940630986-7aa68429-8aa0-4c46-a37b-3a7912a4525f.png)



## 系统启动相关
### 流程图
![](https://cdn.nlark.com/yuque/__mermaid_v3/59224c171ab9c2e4029a61dfa6212a6c.svg)



## 缓存模式相关
### 流程图
![](https://cdn.nlark.com/yuque/__mermaid_v3/1253db148446cf9d1b6cedd8e49eeffb.svg)

## 贡献者
感谢所有参与本项目的贡献者（按字母顺序排列）：

+ [@bytegeek](https://github.com/xrb114) - 渗透测试
+ [@dear-sk](https://github.com/dear-sk) - 系统测试
+ [@Denghls](https://github.com/Denghls) - 需求分析
+ [@hanbingniao](https://github.com/hanbingniao) - 系统测试
+ [@kongcangyimama](https://github.com/kongcangyimama) - 主题设计
+ [@lingview](https://github.com/lingview) - 系统开发
+ [@q1uf3ng](https://github.com/q1uf3ng) - 渗透测试
+ [@YeFeng0712](https://github.com/YeFeng0712) - 需求分析
+ [@yukifia](https://github.com/yukifia) - 需求分析



---

### 💡 特别感谢
+ 感谢所有为本项目贡献代码、提出问题和提供反馈的开发者。
+ 感谢开源社区持续的支持与贡献。

---

如果你在本项目中做出了贡献，请提交 PR 将你的名字加入到致谢名单中！

