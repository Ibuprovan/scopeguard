# TASK-002: 系统架构设计

- **类型**: ARCH
- **状态**: DONE
- **优先级**: HIGH
- **负责人**: architect
- **依赖**: TASK-001 (PRD)
- **创建时间**: 2026-06-29
- **完成判据**: `docs/architecture.md` 存在并覆盖技术选型、目录结构、路由设计、数据流、部署方案

## 描述

基于 PRD 中的功能需求和数据模型，设计 ScopeGuard 的系统架构。架构需符合 Next.js + Supabase 技术栈，单用户工具约束。

## 输入文件

- `docs/prd.md` — 产品需求文档
- `AGENTS.md` — 项目约束
- `idea.html` — 产品概念页

## 产出文件

- `docs/architecture.md` — 系统架构设计文档

## 验收标准

1. 明确 Next.js App Router 目录结构（src/ 或 app/ 布局）
2. 组件树设计（页面级组件、共享组件）
3. Server Actions vs API Routes 的分工策略
4. Supabase 集成方案（客户端 + 服务端）
5. 认证流程（Supabase Auth）
6. 部署方案（Vercel）
7. 安全考虑（RLS 行级安全）

## 流转记录

| 时间 | 从 | 到 | 说明 |
|------|----|----|------|
| 2026-06-29 | PMO | architect | TASK-001 DONE，创建架构任务 |
| 2026-06-29 | architect | PMO | 架构文档写入失败，改用 general |
| 2026-06-29 | general | PMO | architecture.md 完成（12868 bytes, 378行） |
| 2026-06-29 | PMO | - | 验证通过 → DONE |
