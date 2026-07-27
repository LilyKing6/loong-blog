# Loong 博客与文档站数据模型草案

> 目标：支撑前后端分离的博客系统与 Loong 文档站，兼顾自由发帖、草稿、发布、版本、评论、标签与权限管理。

## 1. 通用基础实体

### User
- id
- username
- display_name
- email
- password_hash
- avatar_url
- bio
- role
- status
- created_at
- updated_at

### Role
- id
- name
- description
- created_at
- updated_at

### Permission
- id
- code
- description

### UserRole
- user_id
- role_id

### RolePermission
- role_id
- permission_id

---

## 2. 博客内容模型

### Post
- id
- slug
- title
- summary
- content_markdown
- content_html
- author_id
- status: draft | published | archived
- category_id
- cover_image_url
- published_at
- created_at
- updated_at

### PostRevision
- id
- post_id
- title
- summary
- content_markdown
- content_html
- editor_id
- created_at

### Category
- id
- slug
- name
- description
- parent_id
- sort_order
- created_at
- updated_at

### Tag
- id
- slug
- name
- created_at
- updated_at

### PostTag
- post_id
- tag_id

### Comment
- id
- post_id
- parent_id
- author_name
- author_email
- content
- status
- created_at
- updated_at

### PostStats
- post_id
- view_count
- comment_count
- like_count
- last_viewed_at

---

## 3. 文档站内容模型

### DocPage
- id
- slug
- title
- summary
- content_markdown
- content_html
- version_id
- parent_id
- sort_order
- status: draft | published
- created_at
- updated_at

### DocRevision
- id
- page_id
- title
- summary
- content_markdown
- content_html
- editor_id
- created_at

### DocVersion
- id
- code
- name
- description
- is_default
- created_at
- updated_at

### DocNavNode
- id
- version_id
- page_id
- parent_id
- sort_order
- label

---

## 4. 平台配置模型

### SiteSettings
- id
- site_name
- site_description
- base_url
- theme_name
- posts_page_size
- docs_page_size
- allow_comments
- allow_registration
- created_at
- updated_at

### UploadAsset
- id
- file_name
- file_path
- mime_type
- file_size
- uploaded_by
- created_at

### AuditLog
- id
- actor_id
- action_name
- target_type
- target_id
- detail
- created_at

---

## 5. 设计原则

- 博客和文档站共享 `User`、`Revision`、`Tag`、`Category` 这类基础概念。
- 博客内容以 `Post` 为核心，文档以 `DocPage` 为核心。
- 草稿和版本必须保留，便于编辑与回滚。
- 前端不直接依赖数据库结构，只消费 DTO/API。
- 权限与内容分离，避免把业务逻辑写死在页面层。
