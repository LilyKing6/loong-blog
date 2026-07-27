# Loong Web 第一实现切片

## 目标
先做一个最小可用框架，让后续博客和文档站都能在同一底座上扩展。

## 切片范围

### 1. HTTP 基础
- request
- response
- method
- status
- header
- content-type

### 2. 路由
- 静态路由
- 方法匹配
- 404 / 405
- 路由组

### 3. 中间件
- logger
- recover
- cors
- request id

### 4. 静态资源
- `site/` 或 `assets/`
- Content-Type 推断
- 简单缓存头

### 5. 最小应用
- `GET /api/health`
- `GET /`
- 一个 JSON 返回接口
- 一个静态页面返回接口

## 成功标志
- [x] 服务能启动
- [x] 路由能工作
- [x] 中间件能串起来
- [x] 静态资源能返回
- [x] 前端后续可以直接接 API

## 已落地内容
- `web.app` 提供框架自带测试路由：`GET /api/health`、`GET /api/framework`
- `web.routing` 提供动态路由注册、方法匹配、405 和 OPTIONS 响应
- `web.static` 提供静态资源查找、rewrite 和变量替换
- `web.middleware` 提供统一响应头、CORS、request id、request/response 日志和 JSON 错误响应
- `web.json` 提供 JSON 构造、响应写出、解析和类型解码包装
- `web.form` 提供 query/form key-value 解析；`GET /api/echo` 用于 smoke test 查询参数绑定
- `web.config` 从 CLI 参数和环境变量加载端口、资源根目录和 CORS origin
- `web.middleware` 已按 `Content-Length` 读取请求体并向路由传递 headers/body
- `web.session`、`web.auth` 和 `web.upload` 提供演示级 cookie session、权限检查和上传元数据解析
- `blog` 提供静态 demo 文章 CRUD API、`status` 过滤和 `publish` / `draft` 状态切换，用于验证后端路由、body 读取和 auth 写保护
- `blog` 和 `docs` target 通过 `serveWithRoutes` 复用同一套 server
- `site/` 提供默认首页和 CSS，用于 smoke test

## 第二步基础能力
- [x] JSON 编解码工具层
- [x] query/form 字段解析
- [x] CLI/env 配置加载
- [x] request/response 日志
- [x] 统一 JSON 错误响应
- [x] 可配置 CORS

## 当前边界（2026-07-01 更新）
- HTTP 请求体已读取，但 multipart、chunked transfer 和上传落盘还未实现。
- session/auth 仍是 demo token，未做密码校验、签名、过期时间或持久化存储。
- 博客数据在进程内存中持久化（`BlogState`），重启后重置。
- Post 尚未关联 categoryId 和 tags。
- query/form 的 percent decode 尚未补齐，目前只处理 `+` 到空格。
- `createPost`/`updatePost`/`deletePost` 当前是纯函数，不对模块级状态实际生效。

## 不做的事
- 不做数据库
- 不做完整博客功能
- 不做完整文档树
- 不做编辑器
- 不做登录体系的完整实现
