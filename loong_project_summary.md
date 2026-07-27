# Loong Web 项目说明

## 项目目标
把 Loong 的 Web 能力做成一个可复用框架，并在其上构建前后端分离的博客和文档站。

## 核心分层
- 后端框架
- 博客应用
- 文档应用
- 前端应用
- 共享基础



## 库包打包（lib / bin 拆分）

2026-07-24：框架与共享基础已抽成可复用 `.lpkg` 库包，应用作为 bin 包消费。

- `lib/loong-web`：lib target `web`，21 个模块，产物 `dist/loong.web-0.1.0.lpkg`。
- `lib/loong-shared`：lib target `shared`，2 个模块，产物 `dist/loong.shared-0.1.0.lpkg`。
- 根 `loong.toml` 为 bin 包，含 `webdemo` / `blog` / `docs` 三个 target，通过 path 依赖消费上述库。
- 全部库导出 API 已加显式 `public`（语言规范 §14.5），`[api_index]` 记录 `visibility = "public"`。
- 两个 `.lpkg` 均 `Integrity: valid`；三个 bin 全部 `loc build` 通过，依赖摘要 `lpkg: present`。
- 详见 `loong_library_packaging.md`。

## 当前结论
- `webserver` 应独立演进为框架起点
- 博客需要支持自由发帖、草稿、发布、分类、标签、评论和搜索
- 文档站需要支持目录、版本、Markdown 和搜索
- 前后端必须分离

## 当前进展（2026-07-27）
- ✅ 框架底座（M1）完成：HTTP 请求/响应、路由、中间件、JSON、静态资源、配置、日志、错误处理
- ✅ API 基础设施（M2）完成：表单绑定、session/auth、文件上传、CORS、请求 ID
- ✅ 博客后端（M3）完成：文章 CRUD、草稿/发布、分类/标签 CRUD、评论、搜索、文章版本、Post-分类/标签关联
- ✅ 全部 25 个 `.lo` 源文件已完成 Loong 新语法迁移
- ✅ 框架与共享基础已抽成 `.lpkg` 库包（lib/loong-web、lib/loong-shared），全部导出 API 加 `public`，bin 包通过 path 依赖消费；两个 `.lpkg` 完整性 valid，三个 bin 构建通过
- ✅ 文档后端（M4）完成：页面 CRUD、版本管理、导航树、版本记录、搜索、Markdown 渲染入口（20 个路由，docs/state.lo + docs/docs.lo）
- ✅ 前端应用（M5）完成：博客前端（6 页面）、文档前端（4 页面）、管理后台（7 页面，含登录 + 编辑器），Node.js + EJS SSR，实时 Markdown 预览
- ✅ 体验增强（M6）完成：SEO（meta+OG+sitemap+robots）、RSS feed、示例数据扩充（5 文章+4 文档页）、Docker 化（Dockerfile+compose）、错误页增强

## 推荐文件
- `loong_web_framework_design.md`
- `loong_data_model_design.md`
- `loong_data_model_draft.md`
- `loong_web_milestones.md`
- `loong_frontend_routes.md`
- `loong_api_routes.md`
- `loong_module_tree.md`
- `loong_roadmap.md`
- `loong_execution_checklist.md`
- `loong_first_slice.md`
- `loong_library_packaging.md`

## 开工顺序
1. 先做框架底座
2. 再做博客 API
3. 再做文档 API
4. 再做前端页面
5. 最后打磨推广

## 说明
这套方案适合作为 Loong 对外展示和后续推广的样板工程。
