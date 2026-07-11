# TASK-005: 前端页面与组件实现

- **类型**: FEATURE
- **状态**: DONE
- **优先级**: HIGH
- **负责人**: frontend-dev
- **依赖**: TASK-002 (架构设计), TASK-004 (后端 API)
- **创建时间**: 2026-06-29
- **完成判据**: 所有 6 个页面路由可访问，组件功能正常

## 描述

实现 ScopeGuard 的所有前端页面和组件，包括：落地页、登录、仪表盘、新建项目、项目详情/看板、需求标记、变更报价单。

## 输入文件

- `docs/prd.md` — 页面路由和功能需求
- `docs/architecture.md` — 组件树和目录结构

## 产出文件

页面和组件文件：

- `app/page.tsx` — 首页落地页
- `app/layout.tsx` — 根布局（AuthProvider + Theme）
- `app/(auth)/login/page.tsx` — 登录页（Magic Link）
- `app/(auth)/callback/route.ts` — Auth 回调
- `app/dashboard/page.tsx` — 项目概览仪表盘
- `app/projects/new/page.tsx` — 新建项目页
- `app/projects/[id]/page.tsx` — 项目详情 + 偏差看板
- `app/projects/[id]/requests/page.tsx` — 需求标记列表
- `app/projects/[id]/change-order/page.tsx` — 变更报价单（Pro）
- `components/project-form.tsx` — 新建项目表单
- `components/deliverable-list.tsx` — 交付物列表组件
- `components/scope-request-form.tsx` — 标记需求弹窗
- `components/deviation-dashboard.tsx` — 偏差看板组件
- `components/change-order-preview.tsx` — 变更报价预览组件
- `components/ui/` — 通用 UI 组件

## 验收标准

1. 6 个页面路由全部可访问
2. 偏差看板展示合同进度 + 超范围统计数据
3. 标记需求弹窗支持选择"范围内/超范围"
4. 变更报价单页在非 Pro 用户显示预览模式
5. 所有页面在手机端可操作

## 流转记录

| 时间 | 从 | 到 | 说明 |
|------|----|----|------|
| 2026-06-29 | PMO | frontend-dev | TASK-003 DONE，创建前端任务 |
| 2026-06-29 | frontend-dev | PMO | 首轮无产出，第2轮用 general 完成 |
| 2026-06-29 | general | PMO | 34 个前端文件落盘 → DONE |
