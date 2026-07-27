# Loong 后端 API 路由表

## 实际已实现路由（2026-07-27）

### 通用框架 (webdemo)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/framework` | 框架信息 |
| GET | `/api/echo` | echo 测试 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/me` | 当前用户 |
| POST | `/api/uploads` | 上传 |

### 博客 (blog)
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/blog/health` | 健康检查 | 否 |
| GET | `/api/blog/posts` | 文章列表（支持 ?status=） | 否 |
| GET | `/api/blog/post` | 文章详情（?slug=） | 否 |
| POST | `/api/blog/posts` | 创建文章 | blog.write |
| PUT/PATCH | `/api/blog/posts` | 更新文章 | blog.write |
| POST | `/api/blog/posts/publish` | 发布 | blog.write |
| POST | `/api/blog/posts/draft` | 撤回草稿 | blog.write |
| DELETE | `/api/blog/posts` | 删除 | blog.write |
| GET | `/api/blog/categories` | 分类列表 | 否 |
| POST | `/api/blog/categories` | 创建分类 | blog.write |
| GET | `/api/blog/category` | 分类详情 | 否 |
| PUT | `/api/blog/categories` | 更新分类 | blog.write |
| DELETE | `/api/blog/categories` | 删除分类 | blog.write |
| GET | `/api/blog/tags` | 标签列表 | 否 |
| POST | `/api/blog/tags` | 创建标签 | blog.write |
| GET | `/api/blog/tag` | 标签详情 | 否 |
| PUT | `/api/blog/tags` | 更新标签 | blog.write |
| DELETE | `/api/blog/tags` | 删除标签 | blog.write |
| POST | `/api/blog/posts/category` | 设置文章分类 | blog.write |
| POST | `/api/blog/posts/tag` | 添加文章标签 | blog.write |
| POST | `/api/blog/posts/tag/remove` | 移除文章标签 | blog.write |
| GET | `/api/blog/posts/by-category` | 按分类查文章 | 否 |
| GET | `/api/blog/posts/by-tag` | 按标签查文章 | 否 |
| GET | `/api/blog/posts/comments` | 文章评论列表 | 否 |
| POST | `/api/blog/posts/comments` | 创建评论 | 否 |
| DELETE | `/api/blog/posts/comments` | 删除评论 | blog.write |
| GET | `/api/blog/posts/search` | 文章搜索 | 否 |
| GET | `/api/blog/posts/revisions` | 文章版本列表 | 否 |
| GET | `/api/blog/posts/revision` | 文章版本详情 | 否 |

### 文档 (docs)
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/docs/health` | 健康检查 | 否 |
| GET | `/api/docs/` | 文档首页概览 | 否 |
| GET | `/api/docs/pages` | 页面列表（支持 ?version=） | 否 |
| GET | `/api/docs/page` | 页面详情（?slug=） | 否 |
| POST | `/api/docs/pages` | 创建页面 | docs.write |
| PUT/PATCH | `/api/docs/pages` | 更新页面 | docs.write |
| DELETE | `/api/docs/pages` | 删除页面 | docs.write |
| GET | `/api/docs/pages/search` | 页面搜索 | 否 |
| GET | `/api/docs/pages/revisions` | 页面版本历史 | 否 |
| GET | `/api/docs/pages/revision` | 版本详情 | 否 |
| POST | `/api/docs/pages/render` | Markdown 渲染 | 否 |
| GET | `/api/docs/versions` | 版本列表 | 否 |
| POST | `/api/docs/versions` | 创建版本 | docs.write |
| GET | `/api/docs/version` | 版本详情（?name=） | 否 |
| GET | `/api/docs/nav` | 导航列表 | 否 |
| POST | `/api/docs/nav` | 创建导航节点 | docs.write |
| PUT | `/api/docs/nav` | 更新导航节点 | docs.write |
| DELETE | `/api/docs/nav` | 删除导航节点 | docs.write |
| GET | `/api/docs/nav/tree` | 导航树 | 否 |

---

## 1. 通用 API（设计草案）


## 1. 通用 API

### 健康检查
- `GET /api/health`

### 认证
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### 上传
- `POST /api/uploads`
- `GET /api/uploads/{id}`

---

## 2. 博客 API

### 文章
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/{id}`
- `PUT /api/posts/{id}`
- `DELETE /api/posts/{id}`

### 发布流程
- `POST /api/posts/{id}/publish`
- `POST /api/posts/{id}/draft`
- `GET /api/posts/{id}/revisions`
- `POST /api/posts/{id}/revisions`

### 分类
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/{id}`
- `DELETE /api/categories/{id}`

### 标签
- `GET /api/tags`
- `POST /api/tags`
- `PUT /api/tags/{id}`
- `DELETE /api/tags/{id}`

### 评论
- `GET /api/posts/{id}/comments`
- `POST /api/posts/{id}/comments`
- `DELETE /api/comments/{id}`

### 搜索
- `GET /api/search?q=...`

### 用户
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/{id}`
- `DELETE /api/users/{id}`

---

## 3. 文档站 API

### 页面
- `GET /api/docs`
- `GET /api/docs/tree`
- `GET /api/docs/{slug}`
- `PUT /api/docs/{slug}`
- `DELETE /api/docs/{slug}`

### 版本
- `GET /api/docs/versions`
- `POST /api/docs/versions`
- `PUT /api/docs/versions/{id}`
- `DELETE /api/docs/versions/{id}`

### 导航
- `GET /api/docs/nav`
- `PUT /api/docs/nav`

### 搜索
- `GET /api/docs/search?q=...`

---

## 4. 管理后台 API

### 概览
- `GET /api/admin/overview`

### 站点设置
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

### 审核与日志
- `GET /api/admin/audit-logs`
- `GET /api/admin/comments/pending`
- `POST /api/admin/comments/{id}/approve`
- `POST /api/admin/comments/{id}/reject`

---

## 5. 设计原则

- REST 风格优先。
- 博客与文档站分开命名空间。
- 后台 API 单独加 `/api/admin` 前缀。
- 列表接口都支持分页、排序、筛选。
- 所有写操作都走鉴权中间件。
- 前端只依赖这些稳定接口，不碰内部存储实现。