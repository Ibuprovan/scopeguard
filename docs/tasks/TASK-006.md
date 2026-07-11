# TASK-006: 代码审查

- **类型**: FEATURE
- **状态**: DONE
- **优先级**: HIGH
- **负责人**: reviewer
- **依赖**: TASK-004, TASK-005 (后端+前端实现)
- **创建时间**: 2026-06-29
- **完成判据**: `docs/review-report.md` 存在且包含对两轴的评估

## 描述

对所有已实现的代码进行审查，评估两个维度：
1. **Standards**（代码规范）：是否符合 TypeScript/Next.js 最佳实践、代码组织是否合理
2. **Spec**（需求符合度）：代码是否满足 PRD 中的功能需求

## 输入文件

- `docs/prd.md` — 功能需求
- `docs/architecture.md` — 架构规范
- 所有 `app/`, `components/`, `lib/`, `types/`, `middleware.ts`, `package.json` 等实现文件

## 产出文件

- `docs/review-report.md` — 审查报告

## 验收标准

1. 覆盖 Standards 和 Spec 两个维度
2. 发现的问题有具体行号或文件位置
3. 严重问题标记为 BLOCKER/MAJOR/MINOR
4. 给出修复建议

## 流转记录

| 时间 | 从 | 到 | 说明 |
|------|----|----|------|
| 2026-06-29 | PMO | reviewer | TASK-004/005 DONE，创建审查任务 |
| 2026-06-29 | general | PMO | review-report.md 完成（12031 bytes, 169行）→ DONE |
| 2026-06-29 | PMO | - | 验证通过，CONDITIONAL PASS（2 BLOCKER, 8 MAJOR） |
