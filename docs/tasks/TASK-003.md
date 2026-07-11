# TASK-003: 数据库物理建模

- **类型**: ARCH
- **状态**: DONE
- **优先级**: HIGH
- **负责人**: dba
- **依赖**: TASK-002 (架构设计)
- **创建时间**: 2026-06-29
- **完成判据**: `docs/database.md` 存在且包含完整的 PostgreSQL DDL、索引策略、RLS 策略

## 描述

基于 PRD 的数据模型（5 个实体）和架构设计中的技术选型（Supabase PostgreSQL），编写完整的数据库物理建模文档和 DDL 脚本。

## 输入文件

- `docs/prd.md` — 数据模型定义（第3节）
- `docs/architecture.md` — 架构设计（Supabase 集成、安全策略）
- `AGENTS.md` — 项目约束

## 产出文件

- `docs/database.md` — 数据库设计文档

## 验收标准

1. 所有表的 DDL（CREATE TABLE）完整
2. 主键、外键、索引策略明确
3. enum 类型定义
4. RLS 行级安全策略
5. 种子数据脚本建议

## 流转记录

| 时间 | 从 | 到 | 说明 |
|------|----|----|------|
| 2026-06-29 | PMO | dba | TASK-002 DONE，创建 DBA 任务 |
| 2026-06-29 | dba→general | PMO | database.md 完成（13973 bytes, 408行）→ DONE |
