# Loong 前端路由设计草案

## 1. 博客前端路由

### 公网浏览
- `/`：首页
- `/posts`：文章列表
- `/posts/:slug`：文章详情
- `/categories/:slug`：分类页
- `/tags/:slug`：标签页
- `/archive`：归档页
- `/search`：搜索页
- `/about`：关于页

### 交互行为
- 列表页支持分页
- 详情页支持上一篇 / 下一篇
- 标签页、分类页可复用列表组件
- 搜索页支持关键词高亮

---

## 2. 文档前端路由

### 文档浏览
- `/docs`：文档首页
- `/docs/:version`：某版本文档首页
- `/docs/:version/:slug`：文档页面
- `/docs/search`：文档搜索
- `/docs/changelog`：变更日志

### 交互行为
- 左侧目录树固定显示
- 页面支持锚点跳转
- 版本切换保持当前页面尽量可映射
- 文档页默认支持目录自动生成

---

## 3. 管理后台路由

### 登录与控制台
- `/admin/login`：登录页
- `/admin`：控制台首页

### 内容管理
- `/admin/posts`：文章列表
- `/admin/posts/new`：新建文章
- `/admin/posts/:id/edit`：编辑文章
- `/admin/drafts`：草稿箱
- `/admin/categories`：分类管理
- `/admin/tags`：标签管理
- `/admin/comments`：评论管理

### 文档管理
- `/admin/docs`：文档列表
- `/admin/docs/new`：新建文档页
- `/admin/docs/:id/edit`：编辑文档页
- `/admin/docs/tree`：目录树管理
- `/admin/docs/versions`：版本管理

### 系统设置
- `/admin/settings`：站点设置
- `/admin/uploads`：资源管理
- `/admin/users`：用户管理

---

## 4. 前端页面组件层

### 博客公共组件
- ArticleCard
- ArticleList
- ArticleDetail
- CategoryList
- TagList
- SearchBox
- Pagination
- CommentList

### 文档公共组件
- DocSidebar
- DocBreadcrumb
- DocTOC
- DocVersionSwitcher
- DocPage
- DocSearchBox

### 管理后台组件
- Editor
- DraftList
- PublishPanel
- UploadPicker
- CategoryEditor
- TagEditor
- CommentModerator

---

## 5. 前端状态建议

### 博客状态
- 当前用户
- 当前文章列表
- 当前文章详情
- 当前分类/标签
- 搜索条件

### 文档状态
- 当前版本
- 当前目录树
- 当前页面
- 当前目录锚点

### 后台状态
- 登录态
- 编辑中的文章
- 草稿列表
- 上传队列
- 权限信息

---

## 6. 前后端接口配合

前端不直接依赖数据库，只通过 API 获取：

- 列表页数据
- 页面内容
- 登录状态
- 上传结果
- 搜索结果
- 目录树
- 版本信息

---

## 7. 设计原则

- 博客和文档站尽量共用组件。
- 管理后台只负责内容编辑和发布，不混入业务展示逻辑。
- 文章正文与文档正文统一走 Markdown 渲染链路。
- 路由设计要支持后续 SSR 或静态预渲染。