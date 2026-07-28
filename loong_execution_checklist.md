# Loong Web 框架执行清单

## 库包打包与可见性（2026-07-24 — 完成）
- [x] Web 框架抽成 `lib/loong-web`（lib target `web`，21 模块，根聚合 `src/web.lo`）
- [x] 共享基础抽成 `lib/loong-shared`（lib target `shared`，2 模块，根聚合 `src/shared.lo`）
- [x] 根 `loong.toml` 改为 bin 包（webdemo / blog / docs），path 依赖 web / shared
- [x] 全部库导出 API 加显式 `public`（语言规范 §14.5）：web ~117、shared 23 个导出符号
- [x] `loong.web` 与 `loong.shared` 两个 `.lpkg` 完整性 `valid`
- [x] webdemo / blog / docs 三个 bin 全部 `loc build` 通过，依赖摘要 `lpkg: present`
- [ ] 沙箱外运行时 smoke test（库包结构变更后）

库包构建 / 校验命令：
```bash
LOC=/home/lily/Projects/loong/build-gcc-debug/out/loc
$LOC build   --manifest lib/loong-shared/loong.toml
$LOC build   --manifest lib/loong-web/loong.toml
$LOC validate --manifest lib/loong-shared/loong.toml
$LOC validate --manifest lib/loong-web/loong.toml
$LOC inspect lib/loong-web/dist/loong.web-0.1.0.lpkg
$LOC inspect lib/loong-shared/dist/loong.shared-0.1.0.lpkg
$LOC build --manifest lib/loong-web/loong.tomldemo
$LOC build --manifest loong.toml --target blog
$LOC build --manifest loong.toml --target docs
```



## 第 1 步：框架骨架（M1 — 完成）
- [x] 抽取 HTTP request / response
- [x] 抽取 method / status / header / content-type
- [x] 提炼 router
- [x] 提炼 middleware 链
- [x] 提炼静态资源服务

## 第 2 步：基础能力（M2 — 完成）
- [x] JSON 编解码（框架工具层封装 `std.format.json` / `json_orm`；HTTP 已接入固定 `Content-Length` body 读取）
- [x] 表单绑定（query/form key-value 解析与取值）
- [x] 配置加载（CLI 参数 + `LOONG_WEB_PORT` / `LOONG_WEB_CORS_ORIGIN`）
- [x] 日志（request/response 日志与 request id）
- [x] 统一错误响应（JSON 400 / 404 / 405 / 505）
- [x] CORS（统一响应头，可配置 origin）

## 第 3 步：认证与上传（完成）
- [x] session / auth（演示级 cookie session：`loong_session=demo-*`）
- [x] 请求 ID
- [x] 文件上传（基础 body 读取 + 上传元数据 smoke；未做落盘存储）
- [x] 权限控制（`requireUser` / `requirePermission` 基础封装）

## 第 4 步：博客后端（M3 — 完成 ✅）
- [x] post CRUD（内存持久化；`createPost`/`updatePost`/`deletePost` 实际修改模块级状态）
- [x] 草稿 / 发布（支持 `status` 过滤、`publish` / `draft` 状态切换；对状态层实际生效）
- [x] 分类 CRUD（`GET/POST/PUT/DELETE /api/blog/categories`；auth 守卫写操作）
- [x] 标签 CRUD（`GET/POST/PUT/DELETE /api/blog/tags`；auth 守卫写操作）
- [x] 评论（GET/POST/DELETE /api/blog/posts/comments；匿名可评论；createComment 实际调用）
- [x] 搜索（GET /api/blog/posts/search?q=...；title/body contains 匹配）
- [x] 文章版本（更新时自动创建 PostRevision；GET /posts/revisions 列表 + GET /posts/revision 详情）
- [x] 文章-分类/标签 关联（postCreateRoute 支持创建时传 categoryId/tagIds；5 个关联路由验证通过）

## 第 5 步：文档后端（M4 — 完成 ✅）
- [x] doc page CRUD（GET /pages、GET /page、POST/PUT/PATCH/DELETE /pages）
- [x] tree（GET /nav/tree）
- [x] version（GET /versions、POST /versions、GET /version）
- [x] markdown 渲染接口（POST /pages/render）
- [x] doc search（GET /pages/search?q=...）
- [x] 导航（GET /nav、POST/PUT/DELETE /nav）

## 第 6 步：前端（M5 — 完成 ✅）
- [x] 博客前端：首页、文章列表、文章详情（含评论）、分类、标签、搜索（6 个页面，EJS SSR）
- [x] 文档前端：文档首页、版本列表、文档详情、搜索（4 个页面，左侧导航栏 + Markdown 渲染）
- [x] 管理后台：仪表盘、文章列表、文章编辑器、分类管理、标签管理（7 个页面，Node + EJS）
- [x] 登录页：对接 POST /api/auth/login，cookie session 中转
- [x] 编辑器：实时 Markdown 双栏预览（编辑 / 预览），与服务端 renderMarkdown 一致

## 第 7 步：增强（M6 — 完成 ✅）
- [x] 预览（编辑器实时 Markdown 双栏预览）
- [x] SEO（meta description + Open Graph + sitemap.xml + robots.txt）
- [x] RSS / sitemap（feed.xml + sitemap.xml）
- [x] 示例数据（博客 5 篇文章 + 3 评论；文档 4 页面 + 4 导航节点）
- [x] Docker（Dockerfile + docker-compose.yml，后端+前端编排）
- [x] API 文档（/api-docs 页面，50 个端点完整参考）

- [x] 性能与缓存（内存 TTL 缓存 60s，写操作自动失效）

## 平台级完成
- [x] Loong 新语法迁移：全部 25 个 `.lo` 源文件迁移到新语法（39 struct、3 enum、~50 个 lambda）
- [x] 所有 3 个 target 通过 `loc validate` 和 `loc build`

## 当前验证
- [x] `web` target 通过 `loc validate` 和 `loc build`
- [x] `blog` target 通过 `loc validate`（2199 类型/8701 函数）和 `loc build`（blog.lx 134883 指令）
- [x] `docs` target 通过 `loc validate`（2182 类型/8596 函数）和 `loc build`（docs.lx 112226 指令）
- [x] `web` 运行时 smoke test：`/`、`/app.css`、`/api/health`、`/api/framework`、`/api/echo`、JSON 404、OPTIONS/CORS
- [x] `web` auth/upload smoke test：`POST /api/auth/login`、`GET /api/auth/me`、未登录 `POST /api/uploads` 401、登录后 `POST /api/uploads` 201
- [x] `blog` 运行时 smoke test：`/api/blog/health`、`GET /api/blog/posts?status=all|draft|published`、`GET /api/blog/post?slug=hello-loong`、详请 404、未登录写入 401、登录后 create/update/delete、非法 `status` 400、`POST /api/blog/posts/publish`、`POST /api/blog/posts/draft`、共享静态首页
- [x] `blog` 分类/标签 CRUD smoke test：`GET /api/blog/categories`、`POST /api/blog/categories`（auth）、`GET /api/blog/category?slug=`、`GET /api/blog/tags`、`POST /api/blog/tags`（auth）、`GET /api/blog/tag?slug=`
- [x] `docs` 运行时 smoke test：`/api/docs/health`、`/api/docs/pages`、共享静态首页
- [x] `LOONG_WEB_CORS_ORIGIN=http://example.test` 验证自定义 CORS origin
- [x] request/response 日志验证：服务端输出 `Request received` / `Writing response`

## 验证命令
```bash
/home/lily/Projects/loong/build-gcc-debug/out/loc validate --manifest loong.toml --target web
/home/lily/Projects/loong/build-gcc-debug/out/loc validate --manifest loong.toml --target blog
/home/lily/Projects/loong/build-gcc-debug/out/loc validate --manifest loong.toml --target docs
/home/lily/Projects/loong/build-gcc-debug/out/loc build --manifest loong.toml --target web
/home/lily/Projects/loong/build-gcc-debug/out/loc build --manifest loong.toml --target blog
/home/lily/Projects/loong/build-gcc-debug/out/loc build --manifest loong.toml --target docs

/home/lily/Projects/loong/build-gcc-debug/out/lort blog.lx serve -p 18105 -r '*/>{SOURCE}index.html' -R site

# 文章
curl -i http://127.0.0.1:18105/api/blog/posts?status=all
curl -i http://127.0.0.1:18105/api/blog/post?slug=hello-loong
curl -i -X POST http://127.0.0.1:18105/api/blog/posts -H 'Cookie: loong_session=demo-lily' -d 'title=New&body=Body&slug=new&status=published'
curl -i -X PUT 'http://127.0.0.1:18105/api/blog/posts?slug=hello-loong' -H 'Cookie: loong_session=demo-lily' -d 'title=Updated'
curl -i -X POST 'http://127.0.0.1:18105/api/blog/posts/publish?slug=framework-notes' -H 'Cookie: loong_session=demo-lily'
curl -i -X DELETE 'http://127.0.0.1:18105/api/blog/posts?slug=framework-notes' -H 'Cookie: loong_session=demo-lily'

# 分类
curl -i http://127.0.0.1:18105/api/blog/categories
curl -i -X POST http://127.0.0.1:18105/api/blog/categories -H 'Cookie: loong_session=demo-lily' -d 'slug=devops&name=DevOps'
curl -i http://127.0.0.1:18105/api/blog/category?slug=tech

# 标签
curl -i http://127.0.0.1:18105/api/blog/tags
curl -i -X POST http://127.0.0.1:18105/api/blog/tags -H 'Cookie: loong_session=demo-lily' -d 'slug=testing&name=Testing'
curl -i http://127.0.0.1:18105/api/blog/tag?slug=testing

# 未登录写保护
curl -i -X POST http://127.0.0.1:18105/api/blog/categories -d 'slug=hack&name=Hack'
curl -i -X POST http://127.0.0.1:18105/api/blog/posts -d 'title=Hack'
```

说明：在当前 Codex 沙箱内直接运行 `loc validate` 会长时间无输出；沙箱外运行可正常返回诊断并完成验证。

## 当前限制
- HTTP 层已读取 `Content-Length` 对应 body，但尚未支持 chunked transfer、multipart 解析和上传落盘。
- session/auth 当前是演示级 cookie token，不包含密码校验、签名、过期时间或持久化 session store。
- ~~博客数据在进程内存中持久化，重启服务后重置为初始化状态。~~ ✅ 已修复：JSON 文件持久化（data/blog-state.json）
- ~~`urlDecode` 目前只处理 `+` 到空格，百分号转义解码待后续补齐。~~ ✅ 已修复：完整 percent-encoding 解码（%XX + 大小写 hex）
- ~~category/tag CRUD 在当前进程内持久化，重启服务后重置。~~ ✅ 已修复：所有 CRUD 操作持久化到 JSON 文件
