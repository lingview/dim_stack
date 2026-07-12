#!/bin/bash

set -e

SKIP_BACKEND=false
SKIP_FRONTEND=false

show_help() {
    cat <<EOF
用法: $0 [选项]

选项:
  --skip-backend, -nb   跳过后端 Maven 打包，仅构建前端并复制到后端静态资源目录
  --skip-frontend, -nf  跳过前端构建，仅打包后端
  --help, -h            显示此帮助

示例:
  $0                          # 完整构建前后端
  $0 --skip-backend           # 只构建前端
  $0 --skip-frontend          # 只构建后端
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --skip-backend|-nb) SKIP_BACKEND=true; shift ;;
        --skip-frontend|-nf) SKIP_FRONTEND=true; shift ;;
        --help|-h) show_help; exit 0 ;;
        *) echo "未知参数: $1"; exit 1 ;;
    esac
done

if $SKIP_BACKEND && $SKIP_FRONTEND; then
    echo "同时跳过后端和前端，无需任何操作"
    exit 0
fi

if ! $SKIP_FRONTEND; then
    if ! command -v node >/dev/null; then
        echo "Node.js 未安装"
        exit 1
    fi
    NODE_VERSION_FULL=$(node -v)
    if [[ $NODE_VERSION_FULL =~ ^v([0-9]+)\. ]]; then
        NODE_MAJOR=${BASH_REMATCH[1]}
    else
        echo "无法解析 Node.js 版本: $NODE_VERSION_FULL"
        exit 1
    fi
    if [ "$NODE_MAJOR" -lt 22 ]; then
        echo "Node.js 版本过低，需要 >=22，当前: $NODE_MAJOR"
        exit 1
    fi
    echo "Node.js $NODE_MAJOR 满足要求"

    command -v npm >/dev/null || { echo "npm 未安装"; exit 1; }
    echo "npm 已安装"
fi

if ! $SKIP_BACKEND; then
    if ! command -v java >/dev/null; then
        echo "Java 未安装"
        exit 1
    fi
    JAVA_VERSION_FULL=$(java -version 2>&1 | head -n1)
    if [[ $JAVA_VERSION_FULL =~ version\ \"([0-9]+)\. ]]; then
        JAVA_MAJOR=${BASH_REMATCH[1]}
    elif [[ $JAVA_VERSION_FULL =~ version\ \"([0-9]+)\" ]]; then
        JAVA_MAJOR=${BASH_REMATCH[1]}
    else
        echo "无法解析 Java 版本: $JAVA_VERSION_FULL"
        exit 1
    fi
    if [ "$JAVA_MAJOR" -lt 17 ]; then
        echo "Java 版本过低，需要 >=17，当前: $JAVA_MAJOR"
        exit 1
    fi
    echo "Java $JAVA_MAJOR 满足要求"

    command -v mvn >/dev/null || { echo "Maven 未安装"; exit 1; }
    echo "Maven 已安装"
fi

if ! $SKIP_FRONTEND; then
    echo "清理旧前端构建产物..."
    rm -rf frontend/dist

    echo "构建前端..."
    cd frontend
    npm install
    npm run build
    cd ..

    echo "复制前端构建产物到后端..."
    BACKEND_STATIC="backend/src/main/resources/static"
    mkdir -p "$BACKEND_STATIC"
    rm -rf "${BACKEND_STATIC:?}"/*
    cp -r frontend/dist/* "$BACKEND_STATIC"/

    if $SKIP_BACKEND; then
        echo "前端构建完成（跳过后端打包）！"
        exit 0
    fi
fi

if ! $SKIP_BACKEND; then
    echo "清理旧后端构建产物..."
    rm -rf backend/target

    echo "构建后端 (Maven)..."
    cd backend
    mvn clean package -DskipTests
    cd ..

    echo "移动 JAR 包到当前目录..."
    JAR_COUNT=$(ls backend/target/*.jar 2>/dev/null | wc -l)
    if [ "$JAR_COUNT" -eq 0 ]; then
        echo "未在 backend/target/ 中找到 JAR 文件"
        exit 1
    fi
    mv backend/target/*.jar ./
    echo "JAR 已移至项目根目录"

    if $SKIP_FRONTEND; then
        echo "后端构建完成（跳过前端构建）！"
    else
        echo "构建完成！"
    fi
fi