#!/bin/bash
# Loong Blog — 一键启动前后端
# 用法: ./start.sh [blog|docs|webdemo]
# 默认启动 blog 后端 + Node 前端

set -e

# === 配置 ===
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOC_BIN="${LOC_BIN:-/home/lily/Projects/loong/build-gcc-debug/out/loc}"
LORT_BIN="${LORT_BIN:-/home/lily/Projects/loong/build-gcc-debug/out/lort}"
BUILD_DIR="$PROJECT_DIR/build"
DATA_DIR="$PROJECT_DIR/data"
BACKEND_PORT=8080
FRONTEND_PORT=3000
TARGET="${1:-blog}"

# === 颜色 ===
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Loong Blog 一键启动 ===${NC}"
echo -e "${BLUE}Target:${NC} $TARGET"
echo -e "${BLUE}后端:${NC} http://localhost:$BACKEND_PORT"
echo -e "${BLUE}前端:${NC} http://localhost:$FRONTEND_PORT"
echo ""

# === 1. 准备目录 ===
echo -e "${YELLOW}[1/4] 准备目录...${NC}"
mkdir -p "$BUILD_DIR" "$DATA_DIR/uploads"
echo -e "${GREEN}✓ build/ + data/ 就绪${NC}"

# === 2. 构建后端 ===
echo -e "${YELLOW}[2/4] 构建后端 ($TARGET)...${NC}"
cd "$PROJECT_DIR"
$LOC_BIN build --manifest loong.toml --target "$TARGET" -o "$BUILD_DIR/${TARGET}.lx" 2>&1 | grep -E "Successfully compiled|error" || true
echo -e "${GREEN}✓ 后端构建完成 → build/${TARGET}.lx${NC}"

# === 3. 检查前端依赖 ===
echo -e "${YELLOW}[3/4] 检查前端依赖...${NC}"
cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  echo "  安装 npm 依赖..."
  npm install --silent 2>&1 | tail -1
fi
echo -e "${GREEN}✓ 前端依赖就绪${NC}"

# === 4. 启动服务 ===
echo -e "${YELLOW}[4/4] 启动服务...${NC}"
echo ""

# 启动后端
cd "$PROJECT_DIR"
echo -e "${BLUE}→ 后端 ($TARGET) 端口 $BACKEND_PORT${NC}"
"$LORT_BIN" "$BUILD_DIR/${TARGET}.lx" serve -p "$BACKEND_PORT" -r '*/>{SOURCE}index.html' -R site &
BACKEND_PID=$!
echo "  PID: $BACKEND_PID"

# 等待后端启动
sleep 2

# 启动前端
cd "$PROJECT_DIR/frontend"
echo -e "${BLUE}→ 前端 (Node) 端口 $FRONTEND_PORT${NC}"
BLOG_API_URL="http://localhost:$BACKEND_PORT/api/blog" \
DOCS_API_URL="http://localhost:$BACKEND_PORT/api/docs" \
PORT=$FRONTEND_PORT \
node server.js &
FRONTEND_PID=$!
echo "  PID: $FRONTEND_PID"

echo ""
echo -e "${GREEN}=== 全部启动完成 ===${NC}"
echo -e "${BLUE}前端:${NC} http://localhost:$FRONTEND_PORT"
echo -e "${BLUE}后端 API:${NC} http://localhost:$BACKEND_PORT/api/$TARGET/health"
echo -e "${BLUE}管理后台:${NC} http://localhost:$FRONTEND_PORT/admin/login"
echo -e "${BLUE}API 文档:${NC} http://localhost:$FRONTEND_PORT/api-docs"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 清理函数
cleanup() {
  echo ""
  echo -e "${YELLOW}正在停止服务...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  echo -e "${GREEN}已停止${NC}"
}

trap cleanup EXIT INT TERM

# 等待子进程
wait
