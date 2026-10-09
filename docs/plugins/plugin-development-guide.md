# 次元栈 - 插件开发文档

面向插件开发者的接口说明与完整示例。

> 配套可运行示例工程：`plugin_example/hello/`，可编译安装（首次构建前需先安装 SDK，见 2.5）。文档中的 `my-plugin` 为占位名，示例工程统一使用 `hello`

## 一、插件能做什么

一个插件就是一个 jar，安装后在宿主里独立运行：

- **后端接口**：插件里的 Spring 组件由宿主加载进插件自己的容器，接口挂载在 `/api/plugins/{插件id}/` 下
- **前端界面**：插件可以把页面、组件以 ES 模块的形式接入宿主前台和后台，与宿主共享同一份 React
- **后台菜单**：通过声明文件往后台侧边栏添加菜单
- **数据库**：与宿主同一个库，用插件专属连接池读写自己的表，宿主自动记录 SQL 审计
- **宿主服务**：按白名单读取站点配置、缓存、存储与扩展点

插件接口默认需要登录；确实需要匿名开放的，要在 `plugin.yaml` 里显式声明。

## 二、快速开始

### 2.1 工程结构

```
my-plugin/
├── pom.xml
└── src/main/
    ├── java/xyz/example/myplugin/
    │   └── HelloController.java
    └── resources/
        ├── plugin.yaml                 # 插件描述文件(必需)
        ├── extensions/menu.yaml        # 后台菜单(可选)
        └── ui/                         # 前端界面(可选)
            ├── ui-plugin.json
            ├── entry.js
            └── style.css
```

### 2.2 pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>xyz.example</groupId>
    <artifactId>my-plugin</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- 插件 SDK：BasePlugin / PluginContext / PluginDb 等；运行时由宿主提供 -->
        <dependency>
            <groupId>xyz.lingview.dimstack</groupId>
            <artifactId>dimstack-plugin-api</artifactId>
            <version>1.0-SNAPSHOT</version>
            <scope>provided</scope>
        </dependency>

        <!-- 编译期用的 Spring 注解；运行时由宿主提供 -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>7.0.9</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-web</artifactId>
            <version>7.0.9</version>
            <scope>provided</scope>
        </dependency>
        <!-- 需要 JdbcTemplate 时再加 -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jdbc</artifactId>
            <version>7.0.9</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
</project>
```

> 注意：SDK 与 Spring 依赖必须写 `provided`，不要打进插件 jar。插件运行时拿到的都是宿主的类；自带一份会导致类冲突。

### 2.3 plugin.yaml

```yaml
id: my-plugin
version: 1.0.0
requires: '>=1.0.0'
displayName: 我的插件
description: 演示插件：一个接口 + 一个配置项
author:
  name: 你的名字
scanPackage: xyz.example.myplugin
configMapName: config
publicApiPaths:
  - /hello
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 插件唯一标识，只允许字母、数字、`.`、`_`、`-`，最长 64 位，必须以字母或数字开头 |
| `version` | 是 | 版本号，只允许字母、数字、`.`、`_`、`+`、`-`，最长 32 位；升级时必须修改（当前只校验与当前版本不同） |
| `displayName` | 否 | 后台显示名称 |
| `description` | 否 | 后台显示描述 |
| `author` | 否 | 作者，可以写字符串，也可以写 `{name: xxx}` |
| `scanPackage` | 强烈建议 | Spring 组件扫描包。**不配置的话插件里的组件不会被注册**，插件等于空壳 |
| `publicApiPaths` | 否 | 免登录接口路径（相对 `/api/plugins/{id}`），见[3.6 路由与权限] |
| `managedPaths` | 否 | 随插件分发、由宿主托管的资源目录，目前只支持 `themes/<主题名>` 形式 |
| `configMapName` | 否 | 配置存储名，默认 `config`，见[3.3 插件配置] |
| `requires` | 否 | 期望的宿主版本，当前仅记录，不做校验 |
| `pluginClass` | — | 不需要填写：插件实例统一由宿主创建 |

### 2.4 一个后端接口

```java
package xyz.example.myplugin;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/plugins/my-plugin")
public class HelloController {

    @GetMapping("/hello")
    public Map<String, Object> hello() {
        return Map.of("message", "hello from my-plugin");
    }
}
```

### 2.5 打包与安装

插件依赖的 SDK（`dimstack-plugin-api`）从本地 Maven 仓库解析，首次构建前，先在宿主工程的 `backend` 目录执行一次（宿主升级、SDK 有变化后重跑一次）：

```bash
cd backend && mvn -pl dimstack-plugin-api -am install -DskipTests
```

然后在插件工程里打包：

```bash
mvn clean package
```

打开后台[插件管理 -> 安装插件]，上传 `target/my-plugin-1.0.0.jar`，然后在列表里点[启用]。

规则：

- 只接受 `.jar` 文件，大小不超过 50MB；`plugin.yaml` 的 id、version 必须符合上面的格式
- 上传安装后默认是**停用**状态，需要手动启用
- 直接把 jar 放到宿主的 `plugins/` 目录也可以：启动时会被登记为[待启用]，不会自动运行

## 三、后端开发

### 3.1 插件容器

每个插件有自己独立的 Spring 容器，容器里可以拿到三类东西：

1. 插件自己 `scanPackage` 包下的组件（`@Component`、`@RestController` 等）
2. 宿主注入的基础 Bean（配置、数据库，见 3.2）
3. 白名单里的宿主服务（见 3.2 表格）

插件容器**看不到宿主的内部 Bean**，这是有意的隔离设计。

### 3.2 可注入的 Bean

在插件的组件里直接注入即可：

| Bean | 类型 | 用途 |
| --- | --- | --- |
| `pluginContext` | `PluginContext` | 插件 id、版本、配置名 |
| `boundSettingFetcher` | `SettingFetcher` | 读取插件配置 |
| `pluginDb` | `PluginDb` | 表名前缀 + 插件专属连接池 |
| `pluginJdbcTemplate` | `JdbcTemplate` | 直接执行 SQL（已带审计） |
| `extensionGetter` | `ExtensionGetter` | 读取扩展点实现 |

```java
@RestController
@RequestMapping("/api/plugins/my-plugin")
public class HelloController {

    private final PluginContext context;
    private final SettingFetcher settingFetcher;

    public HelloController(PluginContext context, SettingFetcher settingFetcher) {
        this.context = context;
        this.settingFetcher = settingFetcher;
    }
}
```

白名单里还有四个宿主服务可以按**名字**取（宿主类型不在插件类路径上，不能用类型注入）：

| 名字 | 说明 |
| --- | --- |
| `siteConfigService` | 站点配置读写 |
| `cacheService` | 缓存读写 |
| `storageFacadeService` | 文件存储 |
| `extensionGetter` | 扩展点读取（同时是 SDK 接口，可直接按类型注入） |

```java
// 宿主内部类型拿不到编译期依赖, 用名字取后反射调用
Object siteConfig = applicationContext.getBean("siteConfigService");
Object value = siteConfig.getClass().getMethod("getSiteName").invoke(siteConfig);
```

### 3.3 插件配置

- 存储在宿主的 `plugin_config` 表里，存储名由 `plugin.yaml` 的 `configMapName` 决定（默认 `config`）
- 读取接口：`settingFetcher.fetch(配置名, "键", 类型)`——配置名传 `null` 或空串时用插件默认名

```java
Boolean enabled = settingFetcher.fetch(null, "enabled", Boolean.class);
if (enabled == null || enabled) {
    // 默认开启
}
```

- 后台的[设置]面板保存/读取配置走后台接口 `GET/PUT /api/plugins/{id}/config`（需要插件管理权限）；插件如果自带 `config.yaml`，其中的内容会作为默认值展示在设置面板里

### 3.4 数据库访问

插件与宿主同库。**插件自己的表必须通过 `pluginDb.table("名字")` 生成表名**，宿主会自动加前缀：

| 插件 id | `table("posts")` 结果 |
| --- | --- |
| `my-plugin` | `plugin_my_plugin_posts` |
| `demo.plugin` | `plugin_demo_plugin_posts` |

前缀规则：插件 id 转小写，`.` 和 `-` 都替换为 `_`，前后拼 `plugin_` 与 `_`。两个插件归一化后前缀相同时，后启动的一方会被拒绝并报[插件表前缀冲突]，避免共用表空间。

```java
@RestController
@RequestMapping("/api/plugins/my-plugin")
public class NoteController {

    private final PluginDb pluginDb;
    private final JdbcTemplate jdbc;

    public NoteController(PluginDb pluginDb, JdbcTemplate jdbc) {
        this.pluginDb = pluginDb;
        this.jdbc = jdbc;
    }

    @GetMapping("/notes/count")
    public Map<String, Object> count() {
        String table = pluginDb.table("notes");
        jdbc.execute("CREATE TABLE IF NOT EXISTS " + table
                + " (id INT PRIMARY KEY AUTO_INCREMENT, content VARCHAR(255))");
        Integer rows = jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class);
        return Map.of("table", table, "rows", rows);
    }
}
```

**SQL 审计**：宿主只记录三类 SQL，普通读写不会打扰你——

| 类型 | 触发条件 |
| --- | --- |
| 结构变更 | `CREATE`、`ALTER`、`DROP`、`TRUNCATE`、`RENAME`（含注释开头的语句） |
| 写宿主核心表 | `INSERT`、`UPDATE`、`DELETE` 等命中宿主的用户、文章、评论、配置等核心表 |
| 慢查询 | 执行超过 3 秒 |

审计记录在后台[插件管理 -> 审计]里查看，卸载插件后记录仍然保留。需要注意的是：通过任何方式执行的 SQL 都会被记录，包括 `unwrap`、`getConnection` 取到连接后执行的语句。

**数据表不随插件卸载删除**，需要清理的话请在插件自己的逻辑里处理。

### 3.5 扩展点

扩展点机制用于[一个插件提供能力，其他插件或宿主来消费]。SDK 提供标记接口 `ExtensionPoint` 和读取接口 `ExtensionGetter`；具体扩展接口由你定义，随插件一起分发。

```java
// 1. 定义扩展接口(放在你随插件分发的 api 包里)
public interface GreetingProvider extends ExtensionPoint {
    String greet(String name);
}

// 2. 你的插件里给一个实现
@Component
public class DefaultGreeting implements GreetingProvider {
    @Override
    public String greet(String name) {
        return "你好, " + name;
    }
}

// 3. 任意插件(或宿主)里读取全部实现
List<GreetingProvider> providers = extensionGetter.getExtensions(GreetingProvider.class);
```

宿主和所有已启用插件里的实现都会被收集到；停用的插件不参与。实现类用 `@Order` 或 `Ordered` 接口可以控制顺序。

### 3.6 路由与权限

- 插件接口默认走宿主统一鉴权：**必须登录**才能访问
- 需要匿名开放的接口（比如给访客看的页面数据），在 `plugin.yaml` 的 `publicApiPaths` 里声明，路径相对 `/api/plugins/{插件id}`：

```yaml
publicApiPaths:
  - /content      # 对应接口 /api/plugins/my-plugin/content
```

约束：

- 只支持精确路径，不支持 `*`、`{}` 等通配符，最长 128 字符
- 不允许 `//`、`.`、`..` 等路径段
- 不能使用宿主保留路径：`/config`、`/start`、`/stop`、`/upgrade`、`/reload`
- 声明后也只有在插件真的注册了对应路由、且插件处于启用状态时才免登录

### 3.7 后台菜单

插件启动时，宿主会读取插件 jar 里的 `extensions/menu.yaml`，把菜单写入后台侧边栏（挂在[设置 -> 插件管理]下，支持多层级嵌套）：

```yaml
dashboard-menu:
  - title: 我的面板
    link: /dashboard/plugins/my-plugin/home
    icon: plugin
    permission: plugin:management
  - title: 帮助说明
    link: /dashboard/plugins/my-plugin/help
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 菜单文字 |
| `link` | 是 | 跳转路径，建议以 `/dashboard/plugins/{插件id}/` 开头，卸载时宿主按这个前缀清理 |
| `icon` | 否 | 图标名，默认 `plugin` |
| `permission` | 否 | 访问所需权限码，默认 `plugin:management` |

菜单点击后跳转到 `link` 路径；插件在前端注册**与 link 相同路径**的路由（`context.registerRoute`，见 4.2），页面就会渲染在后台框架的内容区里。菜单在插件启用时写入、卸载时清理；停用不删菜单。

## 四、前端插件

插件的前端代码放在 jar 的 `resources/ui/` 目录下，宿主会以静态资源的方式提供：`/plugins/{插件id}/assets/ui/**`。

### 4.1 ui-plugin.json

```json
{
  "format": "esm",
  "entry": "entry.js",
  "style": "style.css"
}
```

| 字段 | 说明 |
| --- | --- |
| `format` | 固定 `esm` |
| `entry` | 入口 JS（`.js` / `.mjs`），必须是 ES 模块 |
| `style` | 可选，插件样式（`.css`） |

### 4.2 entry.js 契约

入口模块的默认导出必须是一个带 `setup(context)` 的对象；宿主启用插件时会调用 `setup`，停用/卸载时会自动回收。

```javascript
import React from 'react';

export default {
    setup(context) {
        // 注册一个前台页面
        context.registerRoute({
            path: '/my-plugin',
            element: React.createElement('div', null, 'Hello from my-plugin'),
        });

        // 给后台仪表盘的挂件区注册一个组件
        context.registerExtensionPoint('dashboard:widgets:create', () =>
            React.createElement('div', null, '我的挂件'));

        // 注册清理回调：插件停用/卸载/重载时会执行
        context.onTeardown(() => {
            console.log('my-plugin 已卸载');
        });
    },
};
```

`setup` 里的 `context` 提供：

| 方法/属性 | 说明 |
| --- | --- |
| `pluginName` / `pluginVersion` | 当前插件的 id 与版本 |
| `registerRoute({path, element})` | 往宿主 SPA 注册页面路由（后台页面与菜单 `link` 用同一路径） |
| `registerExtensionPoint(name, fn)` | 往宿主扩展点注册组件，供宿主的挂槽渲染 |
| `onTeardown(fn)` | 注册清理回调（定时器、全局事件等副作用都在这里释放） |
| `fetchConfig()` | 读取插件配置（需要插件管理权限，适合设置面板） |
| `saveConfig(config)` | 保存插件配置（同上） |

设置面板示例：

```javascript
export default {
    setup(context) {
        context.registerExtensionPoint('plugin:settings:create', () => {
            const [enabled, setEnabled] = React.useState(true);

            React.useEffect(() => {
                context.fetchConfig().then((cfg) => {
                    if (typeof cfg.enabled === 'boolean') setEnabled(cfg.enabled);
                });
            }, []);

            const save = async () => {
                await context.saveConfig({ enabled });
                window.alert('已保存');
            };

            return React.createElement('div', null,
                React.createElement('label', null,
                    React.createElement('input', {
                        type: 'checkbox',
                        checked: enabled,
                        onChange: (e) => setEnabled(e.target.checked),
                    }), ' 启用'),
                React.createElement('button', { onClick: save }, '保存'),
            );
        });
    },
};
```

### 4.3 共享 React

宿主通过 Import Map 提供 `react`、`react-dom`、`react-router-dom`。插件的入口模块必须这样引入：

```javascript
import React from 'react';
```

**不要**把 React 打进你的入口文件（也不要 import 打包后的自己的 React 副本），否则会出现两份 React、页面报错。入口文件建议直接用 `React.createElement` 写，或者用你自己的构建链把 JSX 编译成 ESM——但外部依赖要保留 `import 'react'` 的形式。

### 4.4 资源与缓存

- 样式文件由宿主自动挂载/卸载：启用时加载（URL 带内容指纹），停用/卸载时移除
- 其他资源（图片、字体等）放在 `ui/` 下，通过相对路径引用即可
- 修改插件后重新打包并升级版本号，前端资源会自动刷新缓存

## 五、完整示例

把上面各部分拼起来，就是一个可用的插件：

**plugin.yaml**

```yaml
id: my-plugin
version: 1.0.0
displayName: 我的插件
description: 演示插件
author:
  name: 你的名字
scanPackage: xyz.example.myplugin
```

**NoteController.java**（后端接口 + 数据表）

```java
package xyz.example.myplugin;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import xyz.lingview.dimstack.plugin.api.PluginDb;

import java.util.Map;

@RestController
@RequestMapping("/api/plugins/my-plugin")
public class NoteController {

    private final PluginDb pluginDb;
    private final JdbcTemplate jdbc;

    public NoteController(PluginDb pluginDb, JdbcTemplate jdbc) {
        this.pluginDb = pluginDb;
        this.jdbc = jdbc;
    }

    @GetMapping("/notes/count")
    public Map<String, Object> count() {
        String table = pluginDb.table("notes");
        jdbc.execute("CREATE TABLE IF NOT EXISTS " + table
                + " (id INT PRIMARY KEY AUTO_INCREMENT, content VARCHAR(255))");
        return Map.of("rows", jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class));
    }
}
```

**extensions/menu.yaml**

```yaml
dashboard-menu:
  - title: 我的插件
    link: /dashboard/plugins/my-plugin/home
```

**ui/ui-plugin.json**

```json
{ "format": "esm", "entry": "entry.js", "style": "style.css" }
```

**ui/entry.js**

```javascript
import React from 'react';

export default {
    setup(context) {
        context.registerRoute({
            path: '/my-plugin',
            element: React.createElement('div', null, 'Hello from my-plugin'),
        });
    },
};
```

**ui/style.css**

```css
.my-plugin { color: #1677ff; }
```

打包安装后：前台访问 `/my-plugin` 看到页面，后台菜单出现[我的插件]，`/api/plugins/my-plugin/notes/count` 返回数据表行数。

## 六、生命周期与运维

| 操作 | 会发生什么 |
| --- | --- |
| 安装 | jar 落盘到 `plugins/` 并登记入库，默认停用 |
| 启用 | 创建插件容器、注册后端路由、前端资源上线、加载菜单 |
| 停用 | 关容器、后端路由注销、前端资源下线；数据、配置、菜单保留 |
| 重载 | 相当于停用后立即启用，用于重打包或改配置后重新加载 |
| 升级 | 上传新版本 jar（版本号必须变化并更大）；失败会自动回滚到旧版本 |
| 卸载 | 删除 jar、入库记录、配置与菜单；**数据表与 SQL 审计记录保留** |

- 升级失败时宿主会自动恢复旧版本运行，接口报错里会说明原因
- jar 文件被系统占用删不掉时，后台会提示[请重启后手动清理]，重启后请手动删除 `plugins/` 下的残留 jar
- 插件可能被反复启用/重载，`setup` 里的副作用（定时器、事件监听）务必通过 `onTeardown` 释放

## 七、注意事项

1. `plugin.yaml` 的 id、version 有字符白名单，不符合会直接安装失败
2. `scanPackage` 不配置或写错包名，插件里的组件不会被注册（日志里会显示[注册组件 0 个]）
3. SDK 与 Spring 依赖必须 `provided`，不要打进插件 jar
4. 插件表名一律用 `pluginDb.table()` 前缀；直接写宿主的用户、文章等核心表会被标记为[核心表写入]并告警
5. 免登录接口用 `publicApiPaths` 声明，宿主保留路径（`/config`、`/start`、`/stop`、`/upgrade`、`/reload`）不可占用
6. 前端入口必须 `import React from 'react'`，不要自带 React
7. 插件卸载不会删除你的数据表，需要清理请自行处理
8. 插件与宿主同库同权限，请只操作自己的数据和必要的宿主配置
9. `plugin.yaml` 未加引号的文本值（如 `description`、`displayName`）里不要出现半角冒号加空格（`示例: 接口`），否则 YAML 解析失败，安装只会报[读取 plugin.yaml 失败]且不指出位置；需要冒号时用全角[：]
