# Changelog

## v0.1.0 (2026-07-29)

### 后端
- 博客后端（30 个 API 端点）：文章 CRUD、草稿/发布、分类/标签 CRUD、评论、搜索、版本历史、Post-分类/标签关联
- 文档后端（20 个 API 端点）：页面 CRUD、版本管理、导航树、文档搜索、Markdown 渲染
- JSON 文件持久化：`data/blog-state.json`、`data/docs-state.json`，重启不丢数据
- 文件上传：管理后台编辑器上传图片，写入 `data/uploads/`

### 前端
- Node.js + Express + EJS 服务端渲染（SSR）
- 博客前端（6 页面）：首页、文章列表、文章详情（TOC + 阅读进度条）、分类、标签、搜索
- 文档前端（4 页面）：文档首页、版本列表、文档详情（左侧导航栏）、搜索
- 管理后台（7 页面）：登录、仪表盘、文章编辑器（实时 Markdown 双栏预览 + 图片上传）、分类/标签管理
- API 参考文档页面（50 个端点）
- 暗色/亮色主题切换（localStorage 记忆）
- 分页、加载动画、fade-in 过渡效果

### 体验增强
- SEO：meta description、Open Graph、sitemap.xml、robots.txt
- RSS Feed：/feed.xml
- Docker：Dockerfile + docker-compose.yml（后端+前端编排）
- 一键启动脚本：./start.sh
- 内存缓存（TTL 60s，categories/tags/versions/nav）
- 构建产物统一输出到 build/ 目录
