# 外部资源本地化

系统支持导入其他博客或笔记软件文章的功能，并且可以将文章内的图片、视频外链转化为本地存储。

## 启用方式

在站点配置中开启此功能（默认关闭）。

![外部资源本地化配置1](../../images/localization_of_external_resources_1.png)

## 使用方法

1. 点击快捷工具栏中的下载图标
2. 打开本地化操作页面

![外部资源本地化配置2](../../images/localization_of_external_resources_2.png)

3. 点击"全部本地化"按钮

![外部资源本地化配置3](../../images/localization_of_external_resources_3.png)

4. 后台处理完成后会自动关闭对话框，外链已转化为内部链接

![外部资源本地化配置4](../../images/localization_of_external_resources_4.png)

## 安全防护规则

系统实施了严格的 IP 来源分类与访问控制策略：

### IP 来源控制

- **localhost 请求**（包括 127.0.0.1、localhost）：可访问所有地址（含 localhost、内网和公网）
- **非 localhost 请求**（如局域网客户端）：禁止访问服务器自身的 localhost 或 127.x.x.x 地址，防止对本地服务的探测
- **公网请求**：禁止访问任何私有 IP 地址（10.x.x.x、172.16–31.x.x、192.168.x.x、169.254.x.x 等），仅允许访问公网地址

### DNS 重绑定防护

- 将 localhost、127.0.0.1、任意 *.localhost 子域、127.x.x.x 网段，以及 DNS 解析结果为回环地址的域名均视为本地回环资源
- 建立 HTTP 连接前会重新解析域名，验证所得 IP 是否符合安全策略，防止 DNS 重绑定攻击

### 协议限制

- 仅支持 HTTP 和 HTTPS 协议
- 拒绝 ftp、file 等其他协议

### 客户端 IP 获取

真实客户端 IP 的获取依赖于 `server.forward-headers-strategy: native` 配置，自动从 X-Forwarded-For 等标准代理头中提取原始 IP。

## 法律声明

> 外部资源本地化功能默认关闭，使用者请勿在境外服务器上部署本项目后开启此功能。如在中国境内部署，须确保遵守国家相关法律法规，严禁利用本功能爬取、存储、传播任何违法违规内容。任何个人或组织私自部署、修改、滥用本功能所产生的一切法律责任，均由使用者自行承担，与项目作者无关。
