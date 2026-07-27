# Loong Web Framework + Blog + Docs 首批里程碑

## M1：框架底座 ✅
- 提炼 HTTP 请求/响应
- 路由分发
- middleware 链
- JSON 编解码
- 静态资源服务
- 统一错误响应
- 配置加载
- 日志

## M2：API 基础设施 ✅
- [x] 表单与 JSON 绑定
- [x] session / auth 基础
- [x] 文件上传基础
- [x] CORS
- [x] 请求 ID

## M3：博客后端 ✅
- [x] 文章 CRUD（内存持久化，验证通过）
- [x] 草稿/发布/撤回（验证通过）
- [x] 分类 CRUD（GET/POST/PUT/DELETE；auth 守卫写操作）
- [x] 标签 CRUD（GET/POST/PUT/DELETE；auth 守卫写操作）
- [x] 评论
- [x] 搜索
- [x] 文章版本
- [x] 文章-分类/标签 关联

## M4：文档后端 ✅
- [x] 页面树
- [x] 版本管理
- [x] Markdown 渲染接口
- [x] 文档搜索
- [x] 导航结构

## M5：前端应用 ✅
- [x] 博客前端
- [x] 文档前端
- [x] 管理后台

## M6：体验增强 ✅
- [x] 编辑器
- [ ] 图片上传
- [x] 预览
- [x] SEO
- [x] RSS / sitemap

## M7：推广级打磨
- API 文档
- Docker
- 示例数据
- 错误页
- 性能与缓存

## 优先级
1. 框架底座
2. 博客 API
3. 文档 API
4. 前端页面
5. 体验增强
6. 推广打磨
