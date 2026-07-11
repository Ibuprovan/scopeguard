# TASK-004: 后端核心实现

- **类型**: FEATURE
- **状态**: DONE
- **优先级**: HIGH
- **负责人**: backend-dev
- **依赖**: TASK-003 (数据库建模)
- **创建时间**: 2026-06-29
- **完成判据**: 项目根目录下完成 Next.js 初始化、数据库集成、Server Actions、Auth 保护

## 描述

初始化 Next.js + Supabase 项目，实现后端核心基础设施：数据库客户端、认证中间件、数据操作的 Server Actions、外部分享 API。

## 输入文件

- `docs/prd.md` — 功能需求和数据模型
- `docs/architecture.md` — 架构设计（目录结构、数据流）
- `docs/database.md` — DDL 和 RLS 策略

## 产出文件

后端基础设施文件：

- `package.json`, `tsconfig.json`, `next.config.ts` — 项目初始化
- `lib/supabase/client.ts` — 浏览器端 Supabase 客户端
- `lib/supabase/server.ts` — 服务端 Supabase 客户端
- `lib/supabase/middleware.ts` — Auth 中间件
- `types/index.ts` — 类型定义（映射数据库实体）
- `lib/actions/projects.ts` — 项目 CRUD Server Actions
- `lib/actions/deliverables.ts` — 交付物 CRUD Server Actions
- `lib/actions/scope-requests.ts` — 需求标记 Server Actions
- `lib/actions/change-orders.ts` — 变更报价单 Server Actions
- `app/api/change-orders/[token]/route.ts` — 外部分享 API
- `middleware.ts` — 路由保护

## 验收标准

1. Server Actions 实现完整的 CRUD（Projects, Deliverables, ScopeRequests, ChangeOrders）
2. Auth middleware 保护所有 /dashboard 和 /projects 路由
3. Supabase 客户端正确初始化（服务端 + 浏览器端）
4. 变更报价单外部分享 API 可匿名访问
5. 类型定义与数据库 schema 一致

## 流转记录

| 时间 | 从 | 到 | 说明 |
|------|----|----|------|
| 2026-06-29 | PMO | backend-dev | TASK-003 DONE，创建后端任务 |
| 2026-06-29 | backend-dev | PMO | 首轮无产出，第2轮用 general 完成 |
| 2026-06-29 | general | PMO | 14 个后端文件落盘 → DONE |
