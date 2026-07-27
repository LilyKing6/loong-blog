# Loong Web Framework Design

Loong 的 Web 方向建议演进为一个通用框架底座，再在其上承载博客与文档站两类首批应用。

**Why:** 用户明确希望博客支持自由发帖创作，并且后续要用于 Loong 语言文档；同时要求前后端分离、webserver 独立实现，并希望形成类似 Spring Boot 的推广型框架。

**How to apply:** 后续讨论框架、博客、文档站、API 设计或目录拆分时，优先按”后端框架 / 博客应用 / 文档应用 / 前端应用”四层理解，默认采用前后端分离方案，并以可复用、可推广为目标。

## 当前实现状态
- `lib/loong-web/src/web/context.lo` 定义静态资源、rewrite、路由、站点内容和请求上下文。
- `lib/loong-web/src/web/routing.lo` 负责动态路由匹配、方法匹配、405、OPTIONS 和静态资源 fallback。
- `lib/loong-web/src/web/static.lo` 负责静态资源查找、rewrite 和模板变量替换。
- `lib/loong-web/src/web/middleware.lo` 负责统一响应头、CORS、`X-Request-Id`、request/response 日志和 `Content-Length` body 读取。
- `lib/loong-web/src/web/app.lo` 提供框架级测试 API，包括 `/api/health`、`/api/framework`、`/api/echo`、`/api/auth/login`、`/api/auth/me` 和 `/api/uploads`。
- `lib/loong-web/src/web/json.lo` 封装 JSON 构造、响应和类型解码。
- `lib/loong-web/src/web/form.lo` 封装 query/form key-value 解析。
- `lib/loong-web/src/web/errors.lo` 提供统一 JSON 错误响应。
- `lib/loong-web/src/web/config.lo` 提供 CLI/env 配置加载。
- `lib/loong-web/src/web/session.lo`、`lib/loong-web/src/web/auth.lo`、`lib/loong-web/src/web/upload.lo` 提供演示级 cookie session、权限检查和上传元数据解析。
- `src/blog` 已通过 `serveWithRoutes` 接入共享 server（M3 完成：46 个路由处理器，含文章/分类/标签 CRUD、评论、搜索、版本、关联；blog/state.lo 31 个数据函数）。
- `src/docs` 已通过 `serveWithRoutes` 接入共享 server（M4 完成：20 个路由处理器，含页面 CRUD、版本管理、导航树、版本记录、搜索、Markdown 渲染；docs/state.lo 25 个数据函数）。
- `src/blog/blog.lo` 提供文章 CRUD、分类/标签 CRUD、status 过滤，以及鉴权保护的写操作。
- `src/blog/state.lo` 提供内存持久化的 BlogState（posts, categories, tags + ID 生成），支持跨请求的状态变更。
- 全部 25 个 `.lo` 源文件已完成 Loong 新语法迁移（struct/enum/lambda 语法）。

## 已验证
- `web`、`blog`、`docs` target 均通过 Loong 编译器 `validate` 和 `build`。
- blog 验证：2199 类型 / 8701 函数，build 产物 blog.lx（134883 指令）
- docs 验证：2182 类型 / 8596 函数，build 产物 docs.lx（112226 指令）
- 运行时已验证静态首页、CSS、JSON API、query 解析、JSON 404、OPTIONS/CORS、可配置 CORS origin、request id 响应头、日志、登录 cookie、未登录上传 401、登录后上传 201。
- Blog 端已验证：文章 CRUD、status 过滤、publish/draft 状态切换、分类 CRUD、标签 CRUD、未登录写保护 401。



## 库包形态（2026-07-24）

框架已抽成独立库包 `lib/loong-web`（lib target `web`），产物 `dist/loong.web-0.1.0.lpkg`。
共享基础抽成 `lib/loong-shared`（lib target `shared`）。blog / docs / webdemo 作为 bin 包通过
`path` 依赖消费它们。依据语言规范 §14.5，全部面向包的导出 API 已加显式 `public`（函数 / struct /
enum），内部辅助保持默认不导出。两个 `.lpkg` 完整性均 `valid`，bin 构建显示 `lpkg: present`。
模块路径保持 `web.<name>` / `shared.<name>` 不变，迁移仅移动目录。详见 `loong_library_packaging.md`。

## 当前限制

- HTTP body 当前只支持 `Content-Length`，尚未支持 chunked transfer。
- session/auth 是 demo token，尚未做密码校验、签名、过期时间或持久化 session store。
- upload 当前只解析请求体元数据，尚未做 multipart 解析和文件落盘。
- 博客数据在进程内存中持久化，重启后重置为初始化状态。
- Post 尚未关联 categoryId 和 tags。
- `createPost`/`updatePost`/`deletePost` 当前是纯函数，不对模块级状态实际生效。
