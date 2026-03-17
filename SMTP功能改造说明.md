# SMTP通知服务测试功能改造说明

## 需求目标
- 在“通知服务”中增加 SMTP 配置测试能力。
- 管理员点击“测试”按钮后，直接向指定邮箱发送测试邮件。
- 无需退出登录再登录即可验证 SMTP 配置是否生效。

## 我做的改动

### 1) 后端新增 SMTP 测试请求 DTO
- 新增文件：`backend/src/main/java/xyz/lingview/dimstack/dto/request/SmtpTestRequestDTO.java`
- 包含 SMTP 测试所需字段：
  - smtp_host、smtp_port
  - mail_sender_email、mail_sender_name
  - mail_username、mail_password
  - mail_protocol、mail_enable_tls、mail_enable_ssl
  - test_email
- 增加了基础参数校验（非空、邮箱格式）。

### 2) 后端扩展邮件服务接口
- 修改文件：`backend/src/main/java/xyz/lingview/dimstack/service/MailService.java`
- 新增方法：`sendTestMailWithConfig(...)`
- 作用：支持使用“临时配置”直接发送测试邮件，而不是依赖数据库已保存配置。

### 3) 后端实现 SMTP 测试发送逻辑
- 修改文件：`backend/src/main/java/xyz/lingview/dimstack/service/impl/MailServiceImpl.java`
- 改动：
  - 抽取并复用 `getMailSender(SiteConfig config)`。
  - 新增 `sendTestMailWithConfig(...)` 同步发送测试邮件。
  - 发送失败会抛出异常，便于前端拿到失败原因并提示。

### 4) 后端新增测试 SMTP 接口
- 修改文件：`backend/src/main/java/xyz/lingview/dimstack/controller/SiteConfigController.java`
- 新增接口：`POST /api/site/test-smtp`
- 行为：
  - 接收前端传入的临时 SMTP 参数和收件邮箱。
  - 组装临时 `SiteConfig`。
  - 调用 `mailService.sendTestMailWithConfig(...)`。
  - 成功返回 `success=true`，失败返回 `success=false` + 错误原因。

### 5) 前端通知服务页面新增“测试 SMTP 配置”操作
- 修改文件：`frontend/src/components/dashboard/SiteSettingsView.jsx`
- 新增：
  - `testEmail` 状态（测试收件邮箱）。
  - `testingSmtp` 状态（测试按钮 loading）。
  - `handleSmtpTest` 方法（调用 `/site/test-smtp`）。
  - 在“通知服务”Tab中增加“测试收件邮箱”输入框和“测试SMTP配置”按钮。
- 交互说明：
  - 若关键字段缺失，前端先提示并阻止请求。
  - 点击后立即发送测试邮件，界面提示结果。

### 6) 后端新增自动化测试
- 新增文件：`backend/src/test/java/xyz/lingview/dimstack/test/SiteConfigControllerSmtpTest.java`
- 测试点：
  - SMTP 测试接口成功路径（返回 200 + success=true）。
  - SMTP 测试接口失败路径（返回 400 + success=false）。

## 使用说明（给你）
1. 打开后台 -> 站点设置 -> 通知服务。
2. 填写 SMTP 参数（主机、端口、账号、密码、发件人等）。
3. 在“测试收件邮箱”里填一个可接收邮件的邮箱。
4. 点击“测试SMTP配置”。
5. 页面提示成功后，检查邮箱是否收到“SMTP配置测试邮件”。

## 预期收益
- 不再需要退出并重新登录来侧面验证 SMTP。
- 配置结果可即时验证，降低排错成本。
- 异常可快速定位（认证失败、端口不通、加密方式不匹配等）。
