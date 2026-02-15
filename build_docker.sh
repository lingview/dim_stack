#!/bin/bash
set -e

IMAGE_NAME="dim_stack"
IMAGE_TAG="1.0"
CURRENT_DIR=$(pwd)

FIRST_RUN=false

if [ ! -f "${CURRENT_DIR}/config/application.yml" ]; then
    FIRST_RUN=true
fi

if [ "$FIRST_RUN" = true ]; then
    echo "检测到首次运行，正在初始化系统目录..."

    mkdir -p "${CURRENT_DIR}/config" \
             "${CURRENT_DIR}/upload" \
             "${CURRENT_DIR}/logs"

    sudo chown -R 1001:1001 "${CURRENT_DIR}/config" \
                            "${CURRENT_DIR}/upload" \
                            "${CURRENT_DIR}/logs"

    echo "首次运行：开始构建镜像..."
    docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .

    echo "系统初始化完成。"
else
    echo "检测到已初始化环境，跳过目录与构建步骤。"
fi

docker rm -f dimstack 2>/dev/null || true

echo "启动 Dim Stack - 次元栈 ..."
docker run -d \
  --name dimstack \
  --restart=always \
  --add-host=host.docker.internal:host-gateway \
  -p 2222:2222 \
  -v "${CURRENT_DIR}/config:/dim_stack/config" \
  -v "${CURRENT_DIR}/upload:/dim_stack/upload" \
  -v "${CURRENT_DIR}/logs:/dim_stack/logs" \
  -v "${CURRENT_DIR}/.random_salt:/dim_stack/.random_salt" \
  "${IMAGE_NAME}:${IMAGE_TAG}"

echo ""
echo "Dim Stack - 次元栈 启动成功！"

if [ "$FIRST_RUN" = true ]; then
    echo "首次使用，请初始化系统：http://localhost:2222/init/setup"
else
    echo "访问系统：http://localhost:2222"
fi
