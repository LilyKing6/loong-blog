---
name: Loong data model design
description: Draft schema notes for blog, docs, and admin entities in the Loong web system.
type: project
---

Loong 的博客与文档站建议共享一套基础内容模型，再分别保留各自的展示与组织字段。

**Why:** 用户需要自由发帖的博客能力，同时还要承载 Loong 语言文档；两者都需要草稿、发布、分类组织和版本管理，但内容的组织方式不同。

**How to apply:** 后续设计 API、数据库表、DTO 或前端状态时，优先抽取 post/page/revision/tag/category/user/permission 这类共享概念，再按博客或文档站补充专属字段。