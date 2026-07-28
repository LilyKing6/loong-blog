# loong-blog

基于 [loong-server](https://github.com/LilyKing6/loong-server) 构建的博客与文档站，包含完整前端和管理后台。

## 特性

- **博客后端**：文章 CRUD、草稿/发布、分类/标签、评论、搜索、版本历史
- **文档后端**：页面 CRUD、版本管理、导航树、文档搜索、Markdown 渲染
- **管理后台**：仪表盘、文章编辑器（实时 Markdown 预览）、分类/标签管理、图片上传
- **前端**：Node.js + Express + EJS 服务端渲染，深色主题
- **文件持久化**：JSON 文件存储（data/blog-state.json、data/docs-state.json），重启不丢数据
- **SEO**：meta 标签、Open Graph、sitemap.xml、robots.txt
- **RSS**：/feed.xml
- **Docker**：Dockerfile + docker-compose 一键编排
- **一键启动**：./start.sh

## 快速开始

### 前置条件

- [loong-server](https://github.com/LilyKing6/loong-server) 仓库（克隆到同级目录）
- Loong 编译器 `loc` v2.0.1+ 和运行时 `lort`
- Node.js v18+

### 安装与运行

```bash
# 1. 克隆框架库（同级目录）
git clone https://github.com/LilyKing6/loong-server.git ../loong-server

# 2. 一键启动（自动构建后端 + 安装前端依赖 + 启动）
./start.sh

# 或指定 target
./start.sh blog    # 博客后端
./start.sh docs    # 文档后端
./start.sh webdemo # 演示后端
```

启动后访问：
- 前端：http://localhost:3000
- 后端 API：http://localhost:8080/api/blog/health
- 管理后台：http://localhost:3000/admin/login（输入任意用户名登录）

### 手动构建

```bash
# 构建后端
loc build --manifest loong.toml --target blog
loc build --manifest loong.toml --target docs

# 运行后端
lort blog.lx serve -p 8080 -r '*/>{SOURCE}index.html' -R site

# 运行前端
cd frontend && npm install && npm start
```

## Targets

| Target | 说明 | 构建命令 |
|--------|------|----------|
| `webdemo` | 演示服务器（健康检查、echo、登录、上传） | `loc build --target webdemo` |
| `blog` | 博客后端（30 个 API 端点） | `loc build --target blog` |
| `docs` | 文档后端（20 个 API 端点） | `loc build --target docs` |

## 项目结构

```
loong-blog/
  src/
    blog/           博客应用（blog.lo + state.lo）
    docs/           文档应用（docs.lo + state.lo）
    webdemo/        演示入口
  frontend/         Node.js 前端
    server.js       Express 服务器
    views/          EJS 模板
      admin/        管理后台页面
      docs/         文档前端页面
    public/         静态资源（CSS、JS）
  site/             后端静态资源（HTML、CSS）
  data/             持久化数据（JSON 文件、上传文件）
    blog-state.json
    docs-state.json
    uploads/
  start.sh          一键启动脚本
  Dockerfile
  docker-compose.yml
```

## API 参考

访问 http://localhost:3000/api-docs 查看完整 API 文档（50 个端点）。

## 技术栈

- **后端**：Loong 语言 + loong-server 框架
- **前端**：Node.js + Express + EJS（SSR）
- **部署**：Docker + docker-compose

## 许可证

MIT
