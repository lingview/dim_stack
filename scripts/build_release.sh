#!/bin/bash

set -e

echo "清理旧构建产物..."
rm -rf frontend/dist
rm -rf backend/target

echo "检查必要工具及版本..."

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

echo "构建完成！"