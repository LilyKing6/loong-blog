#!/bin/bash
# Loong Blog — 一键启动前后端
# 启动 blog 后端(8080) + docs 后端(8081) + Node 前端(3000)

set -e

# === 配置 ===
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOC_BIN="${LOC_BIN:-/home/lily/Projects/loong/build-gcc-debug/out/loc}"
LORT_BIN="${LORT_BIN:-/home/lily/Projects/loong/build-gcc-debug/out/lort}"
BUILD_DIR="$PROJECT_DIR/build"
DATA_DIR="$PROJECT_DIR/data"
BLOG_PORT=8080
DOCS_PORT=8081
FRONTEND_PORT=3000

# === 颜色 ===
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Loong Blog 一键启动 ===${NC}"
echo -e "${BLUE}Blog 后端:${NC} http://localhost:$BLOG_PORT"
echo -e "${BLUE}Docs 后端:${NC} http://localhost:$DOCS_PORT"
echo -e "${BLUE}前端:${NC} http://localhost:$FRONTEND_PORT"
echo ""

# === 1. 准备目录 ===
echo -e "${YELLOW}[1/4] 准备目录...${NC}"
mkdir -p "$BUILD_DIR" "$DATA_DIR/uploads"
echo -e "${GREEN}✓ build/ + data/ 就绪${NC}"

# === 2. 构建后端 ===
echo -e "${YELLOW}[2/4] 构建后端...${NC}"
cd "$PROJECT_DIR"
echo "  编译 blog..."
$LOC_BIN build --manifest loong.toml --target blog -o "$BUILD_DIR/blog.lx" 2>&1 | grep -E "Successfully compiled|error" || true
echo "  编译 docs..."
$LOC_BIN build --manifest loong.toml --target docs -o "$BUILD_DIR/docs.lx" 2>&1 | grep -E "Successfully compiled|error" || true
echo -e "${GREEN}✓ 后端构建完成${NC}"

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

PIDS=()

# 启动 blog 后端
cd "$PROJECT_DIR"
echo -e "${BLUE}→ Blog 后端 端口 $BLOG_PORT${NC}"
"$LORT_BIN" "$BUILD_DIR/blog.lx" serve -p "$BLOG_PORT" -r '*/>{SOURCE}index.html' -R site &
BLOG_PID=$!
PIDS+=($BLOG_PID)
echo "  PID: $BLOG_PID"

# 启动 docs 后端
echo -e "${BLUE}→ Docs 后端 端口 $DOCS_PORT${NC}"
"$LORT_BIN" "$BUILD_DIR/docs.lx" serve -p "$DOCS_PORT" -r '*/>{SOURCE}index.html' -R site &
DOCS_PID=$!
PIDS+=($DOCS_PID)
echo "  PID: $DOCS_PID"

# 等待后端启动
echo -e "  Waiting for backends to start..."
for i in $(seq 1 10); do
  BLOG_OK=false
  DOCS_OK=false
  curl -s --max-time 1 http://127.0.0.1:$BLOG_PORT/api/blog/health > /dev/null 2>&1 && BLOG_OK=true
  curl -s --max-time 1 http://127.0.0.1:$DOCS_PORT/api/docs/health > /dev/null 2>&1 && DOCS_OK=true
  if [ "$BLOG_OK" = true ] && [ "$DOCS_OK" = true ]; then
    echo -e "  ${GREEN}✓ Blog 后端就绪${NC}"
    echo -e "  ${GREEN}✓ Docs 后端就绪${NC}"
    break
  fi
  if [ $i -eq 10 ]; then
    [ "$BLOG_OK" = true ] && echo -e "  ${GREEN}✓ Blog 后端就绪${NC}" || echo -e "  ${YELLOW}⚠ Blog 后端未响应${NC}"
    [ "$DOCS_OK" = true ] && echo -e "  ${GREEN}✓ Docs 后端就绪${NC}" || echo -e "  ${YELLOW}⚠ Docs 后端未响应${NC}"
  fi
  sleep 1
done

# 启动前端
cd "$PROJECT_DIR/frontend"
echo -e "${BLUE}→ 前端 (Node) 端口 $FRONTEND_PORT${NC}"
BLOG_API_URL="http://127.0.0.1:$BLOG_PORT/api/blog" \
DOCS_API_URL="http://127.0.0.1:$DOCS_PORT/api/docs" \
PORT=$FRONTEND_PORT \
node server.js &
FRONTEND_PID=$!
PIDS+=($FRONTEND_PID)
echo "  PID: $FRONTEND_PID"

echo ""
echo -e "${GREEN}=== 全部启动完成 ===${NC}"
echo -e "${BLUE}前端:${NC} http://localhost:$FRONTEND_PORT"
echo -e "${BLUE}Blog API:${NC} http://localhost:$BLOG_PORT/api/blog/health"
echo -e "${BLUE}Docs API:${NC} http://localhost:$DOCS_PORT/api/docs/health"
echo -e "${BLUE}管理后台:${NC} http://localhost:$FRONTEND_PORT/admin/login"
echo -e "${BLUE}文档页面:${NC} http://localhost:$FRONTEND_PORT/docs"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 清理函数
cleanup() {
  echo ""
  echo -e "${YELLOW}正在停止服务...${NC}"
  for pid in "${PIDS[@]}"; do
    kill $pid 2>/dev/null || true
  done
  echo -e "${GREEN}已停止${NC}"
}

trap cleanup EXIT INT TERM

# 等待子进程
wait
