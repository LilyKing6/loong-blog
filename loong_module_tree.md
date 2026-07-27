## 实际目录结构（2026-07-24 库包拆分后）

框架与共享基础已抽成 `.lpkg` 库包，应用作为 bin 包消费：

```text
loong_blog/
  lib/
    loong-web/            # lib target "web"  -> dist/loong.web-0.1.0.lpkg
      src/web.lo          # 根聚合 import web.{app,...,upload};
      src/web/{app,auth,config,context,cors,errors,form,http,http_content_type,
               http_header,http_method,http_response,http_statuscode,json,
               logging,middleware,routing,server,session,static,upload}.lo
    loong-shared/         # lib target "shared" -> dist/loong.shared-0.1.0.lpkg
      src/shared.lo       # 根聚合 import shared.{content,routes};
      src/shared/{content,routes}.lo
  src/
    webdemo/main.lo       # bin
    blog/{blog,main,state}.lo   # bin
    docs/{docs,main}.lo         # bin
```

下文"设计目标"的模块树仍作为演进蓝图保留；当前已落地的实际模块见上方结构。

# Loong Web 框架总模块树

## 1. 后端框架

```text
web/
  http/
    server
    request
    response
    method
    status
    header
    content_type
    cookie
  routing/
    router
    route
    params
    group
  middleware/
    chain
    logger
    recover
    cors
    auth
    request_id
    rate_limit
  encoding/
    json
    form
    query
    multipart
  config/
    loader
    env
  files/
    static
    upload
    cache
  auth/
    session
    jwt
    permission
  errors/
    error_response
    exception
  logging/
    logger
    fields
  app/
    bootstrap
    server
    context
```

## 2. 博客后端

```text
blog/
  app
  api/
    posts
    categories
    tags
    comments
    users
    auth
    search
    uploads
  service/
    post_service
    comment_service
    category_service
    tag_service
    user_service
    search_service
  model/
    post
    category
    tag
    comment
    user
    revision
  storage/
    post_repo
    comment_repo
    user_repo
  dto/
    post_dto
    comment_dto
    auth_dto
```

## 3. 文档后端

```text
docs/
  app
  api/
    pages
    tree
    versions
    search
    uploads
    auth
  service/
    page_service
    tree_service
    version_service
    search_service
  model/
    page
    section
    version
    nav_node
  storage/
    page_repo
    version_repo
  dto/
    page_dto
    tree_dto
```

## 4. 前端应用

```text
frontend/
  blog/
    pages/
    components/
    api/
    state/
  docs/
    pages/
    components/
    api/
    state/
  admin/
    pages/
    components/
    api/
    state/
```

## 5. 共享基础

```text
shared/
  dto/
  ui/
  utils/
  constants/
```

## 6. 总体原则

- 框架负责通用能力。
- blog/docs 负责各自业务。
- frontend 只做展示和交互。
- shared 放跨应用复用代码。
- 路由、API、数据模型都以分离和复用为优先。
