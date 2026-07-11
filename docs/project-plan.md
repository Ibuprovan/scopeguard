# ScopeGuard 项目计划

## 项目概述

ScopeGuard 是一款面向华语自由职业者的范围蔓延管理工具。帮助设计师、开发者、文案等独立服务提供者量化并收费化"合同外需求"。

## 技术栈

- 前端：Next.js (App Router)
- 后端：Next.js API Routes + Server Actions
- 数据库：Supabase (PostgreSQL)
- 认证：Supabase Auth
- 部署：Vercel

## 当前阶段

**MVP 开发** — 从概念验证到可运行产品

## 任务分解

| 编号 | 类型 | 标题 | 状态 | 负责人 | 产出 |
|------|------|------|------|--------|------|
| TASK-001 | FEATURE | PRD 编写 + MVP 需求拆解 | DONE | pm (→general) | docs/prd.md ✅ |
| TASK-002 | ARCH | 系统架构设计 | DONE | architect (→general) | docs/architecture.md ✅ |
| TASK-003 | ARCH | 数据库物理建模 | DONE | dba (→general) | docs/database.md ✅ |
| TASK-004 | FEATURE | 后端核心 API 实现 | DONE | backend-dev (→general) | 14 files ✅ |
| TASK-005 | FEATURE | 前端页面与组件实现 | DONE | frontend-dev (→general) | 34 files ✅ |
| TASK-006 | FEATURE | 代码审查 | DONE | reviewer (→general) | docs/review-report.md ✅ (2 BLOCKER, 8 MAJOR) |
| TASK-007 | DEBUG | 修复审查发现的问题 | DONE | general | 6项修复 ✅ |
| TASK-008 | FEATURE | 质量测试 | DONE | qa-engineer (→general) | docs/test-report.md ✅ |

## 里程碑

- ✅ M1: PRD + 架构就绪 → 进入开发
- ✅ M2: 核心功能可运行 → 进入审查
- ✅ M3: 审查 + 测试通过 → MVP 就绪（CONDITIONAL PASS）

---

**8/8 任务完成 | 2026-06-29 | 总产出：9 文档 + 48 代码文件**
