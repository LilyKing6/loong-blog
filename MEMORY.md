# Loong Web Framework Design

Loong 的 Web 方向建议演进为一个通用框架底座，再在其上承载博客与文档站两类首批应用。

**Why:** 用户明确希望博客支持自由发帖创作，并且后续要用于 Loong 语言文档；同时要求前后端分离、webserver 独立实现，并希望形成类似 Spring Boot 的推广型框架。

**How to apply:** 后续讨论框架、博客、文档站、API 设计或目录拆分时，优先按”后端框架 / 博客应用 / 文档应用 / 前端应用”四层理解，默认采用前后端分离方案，并以可复用、可推广为目标。

# Syntax Migration

2026-07-01：完成全部 25 个 `.lo` 源文件的 Loong 新语法迁移（39 个 struct 转为 `{ }` 块体语法、3 个 enum 转为 `{ }` 块体语法、~50 个 `lambda` 关键字转为 `[]` 闭包语法、全部函数转为 `{ }` 块体语法并添加 closure capture lists）。所有 3 个 target（web、blog、docs）通过 `loc validate` 和 `loc build`。

# Category/Tag CRUD

2026-07-01：实现分类和标签的完整 CRUD API。新增 `src/blog/state.lo` 提供 BlogState 数据模型。blog.lo 新增 10 个路由（分类/标签各 5 个：列表、详情、创建、更新、删除），写操作需 `blog.write` 权限。运行时 smoke test 已验证。
# 库包打包（lib / bin 拆分 + public 可见性）

2026-07-24：把 Web 框架与共享基础抽成独立 `.lpkg` 库包，blog/docs/webdemo 作为 bin 包通过
path 依赖消费它们。

- `lib/loong-web`（target `web`，lib）：21 个模块，根聚合 `src/web.lo`。
- `lib/loong-shared`（target `shared`，lib）：2 个模块（content/routes），根聚合 `src/shared.lo`。
- 根 `loong.toml` 为 bin 包，声明 `web = { path = "lib/loong-web" }`、`shared = { path = "lib/loong-shared" }`。

依据语言规范 §14.5，已为全部库导出 API 加上显式 `public`（web ~117 个、shared 23 个导出符号），
内部辅助（如 `web.json::decodeJson`、编译器匿名闭包）保持默认不导出。`.lpkg` 的 `[api_index]`
现在统一记录 `visibility = "public"`，并带 `[[dependency]]` source-fingerprint 元数据。

校验结果：`loong.web` 与 `loong.shared` 两个 `.lpkg` 均 `Integrity: valid`；webdemo / blog / docs
三个 bin 全部 `loc build` 通过，依赖摘要显示 `lpkg: present`。详见 `loong_library_packaging.md`。

历史问题：未加 `public` 时 `loong.web` 曾报 `Integrity: invalid`（5 个模块 stale RELA），
改用显式 `public` 后该 per-module payload 写入路径不再触发，完整性转为 valid。

# M3 博客后端收尾

2026-07-26：完成 M3 博客后端四个剩余子项：
- 评论：commentCreateRoute 改为实际调用 createComment（匿名可评论），返回真实 comment JSON
- 搜索：postSearchRoute 验证通过（title/body contains 匹配）
- 文章版本：postUpdateRoute 更新时自动创建 PostRevision；新增 GET /posts/revisions 和 GET /posts/revision 两个路由
- Post-分类/标签关联：postCreateRoute 支持创建时传 categoryId/tagIds；既有 5 个关联路由逻辑验证通过
全部 46 个路由处理器 + 31 个 state 函数通过 loc validate（2199 类型，8701 函数）和 loc build。

# M4 文档后端

2026-07-27：完成 M4 文档后端完整实现，参照博客后端模式：
- 新建 docs/state.lo（133 行）：DocsState + 种子 DocPage 数据（Getting Started / Installation / Language Basics）+ 全套 CRUD 查询函数
- 重写 docs/docs.lo（525 行）：20 个路由处理器，覆盖页面 CRUD、版本管理、导航树、版本记录、文档搜索、Markdown 渲染入口
- 全部 20 个路由注册在 /api/docs 下，写操作需 docs.write 权限
- loc validate 通过（2182 类型，8596 函数），loc build 成功（docs.lx，112226 条指令）

# M5 前端应用完成

2026-07-27：完成 M5 前端应用全部三个形态，采用 Node.js + Express + EJS 服务端渲染方案：
- 博客前端（6 页面）：首页、文章列表、文章详情（含评论提交）、分类、标签、搜索
- 文档前端（4 页面）：文档首页、版本列表、文档详情（左侧导航 + Markdown 渲染）、搜索
- 管理后台（7 页面）：登录、仪表盘、文章列表、文章编辑器（实时 Markdown 双栏预览）、分类管理、标签管理
- 登录态通过 cookie 中转（代理后端 /api/auth/login 的 Set-Cookie），写操作携带 cookie 鉴权
- 前端代码在 frontend/ 目录，独立 npm 项目，通过 BLOG_API_URL / DOCS_API_URL 环境变量配置后端地址

# M6 体验增强完成

2026-07-27：完成 M6 体验增强：
- SEO：meta description、Open Graph tags、sitemap.xml、robots.txt
- RSS feed：/feed.xml 输出文章 RSS 2.0
- 示例数据扩充：博客 5 篇文章（含完整 Markdown）+ 3 条评论；文档 4 个页面 + 4 导航节点
- Docker 化：Dockerfile + docker-compose.yml（后端 Loong + 前端 Node 编排）
- 错误页增强：404/500 友好提示 + 返回链接
- 编辑器预览：实时 Markdown 双栏预览（M5 已完成，M6 确认）

# M7 推广级打磨完成

2026-07-27：完成 M7 最后两个子项，项目全部里程碑 M1-M7 完成：
- API 文档：/api-docs 页面，覆盖全部 50 个端点（blog 30 + docs 20），含请求/响应示例
- 性能缓存：内存 TTL 缓存（60s），缓存 categories/tags/versions/nav 等不常变数据，写操作自动失效
- Docker、示例数据、错误页增强已在 M6 完成
