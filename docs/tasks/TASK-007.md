# TASK-007: 修复审查发现的问题

- **类型**: DEBUG
- **状态**: DONE
- **优先级**: HIGH
- **负责人**: general
- **依赖**: TASK-006 (代码审查报告)
- **创建时间**: 2026-06-29
- **完成判据**: 2 个 BLOCKER 全部修复，MAJOR 问题至少修复前 4 项

## 描述

根据审查报告 `docs/review-report.md`，修复所有 BLOCKER 和 MAJOR 级别的问题。

## 输入文件

- `docs/review-report.md` — 审查发现的全部问题
- `docs/architecture.md` — 架构规范（Server Actions 优先）
- `docs/prd.md` — 功能需求和验收标准

## 产出文件

修改以下文件的代码（直接编辑）：

### BLOCKER（必须修复）

1. **B1**: `app/api/change-orders/[token]/route.ts` — 将 `Promise<{ params }>` 改为 Next.js 14 同步 `params`
2. **B2**: `app/(auth)/login/page.tsx` — 添加已登录用户检查，重定向到 `/dashboard`

### MAJOR（优先修复前 4 项）

1. **M1**: 将所有 Client-side 数据变更迁移到 Server Actions（`projects/new/page.tsx`, `projects/[id]/page.tsx`, `requests/page.tsx`, `change-order/page.tsx`）
2. **M2**: Server Actions 接入 Zod schema 验证（`lib/actions/projects.ts`, `deliverables.ts`, `scope-requests.ts`, `change-orders.ts`）
3. **M3**: 统一使用 `@supabase/ssr`（替换 `@supabase/auth-helpers-nextjs`）
4. **M6**: `change-order/page.tsx` 添加 Pro 计划服务端校验

## 验收标准

1. 2 个 BLOCKER 全部修复并验证
2. 前 4 个 MAJOR 问题修复
3. 修复后不影响原有功能逻辑

## 流转记录

| 时间 | 从 | 到 | 说明 |
|------|----|----|------|
| 2026-06-29 | PMO | general | 审查发现 2 BLOCKER + 8 MAJOR，开始修复 |
| 2026-06-29 | general | PMO | B1/B2/M1/M2/M3/M6 全部修复 → DONE |
