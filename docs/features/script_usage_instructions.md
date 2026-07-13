# 脚本使用说明

> 所有脚本均在**项目根目录**下执行，通过 `scripts/xxx` 或 `.\scripts\xxx` 路径调用

---

## build_release.sh（linux） / build_release.ps1（windows）

**功能：** 构建前后端产物。包含工具版本检查（Java >= 17、Node.js >= 22），前端构建产物自动复制到后端静态资源目录，最终输出 JAR 包到项目根目录

**用法：**

```bash
# 完整构建前后端
./scripts/build_release.sh
.\scripts\build_release.ps1

# 只构建前端（复制到后端 static 后结束，不打包后端）
./scripts/build_release.sh --skip-backend
.\scripts\build_release.ps1 --skip-backend

# 只打包后端（跳过前端构建）
./scripts/build_release.sh --skip-frontend
.\scripts\build_release.ps1 --skip-frontend
```

---

## build_docker.sh

**功能：** 构建 Docker 镜像并启动容器。首次运行会自动创建 `config/`、`upload/`、`logs/` 目录并构建镜像；后续启动跳过构建步骤直接复用已有镜像

**用法：**

```bash
# 默认宿主机端口 2222，映射到容器内 2222
./scripts/build_docker.sh

# 自定义端口：宿主机 8080 -> 容器内 8080
./scripts/build_docker.sh 8080 8080
```

**首次启动后访问：** `http://localhost:<端口>/init/setup`

---

## git_history.bat / git_history.sh

**功能：** 导出 Git 提交记录到 `commits.txt`，格式：`commit-hash 作者 日期 提交信息`

**用法：**

```bash
# Windows
.\scripts\git_history.bat

# Linux
./scripts/git_history.sh
```

---

## cli_build.sh

**功能：** 使用 Nuitka 将 Python CLI 编译为单文件可执行文件

**用法：**

```bash
./scripts/cli_build.sh
```

**前置依赖：**

```bash
sudo apt-get install gcc patchelf
conda install libpython-static
```

---

## generate_update_log_yaml.py

**功能：** 扫描 Git 历史中 `system_version.txt` 的版本变更记录，自动生成结构化的 `update_log.yaml` 更新日志文件，按版本号分组，提交信息自动归类（新功能、问题修复、安全修复等）

**用法：**

```bash
python scripts/generate_update_log_yaml.py
```