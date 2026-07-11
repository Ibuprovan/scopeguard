# ScopeGuard 任务运行规范

## 状态机

```
TODO → IN_PROGRESS → REVIEWS → TESTING → DONE
  ↑         ↓            ↓          ↓
  └─── REJECTED ←─────────┴──────────┘
                   (超过3次 → BLOCKED)
```

## 任务类型

| 类型 | 说明 |
|------|------|
| `FEATURE` | 新功能、迭代增强 |
| `DEBUG` | 报错、回归、根因排查与修复 |
| `ARCH` | 架构调整、重构、技术仲裁 |
| `RESEARCH` | 方案预研、安全调研、技术验证 |

## 角色分工

| 角色 | 职责 |
|------|------|
| PM | 需求分析、用户场景设计、PRD 编写 |
| Architect | 技术选型、架构设计、接口规范 |
| DBA | 数据库物理建模、索引优化 |
| Backend-dev | 后端业务逻辑、API 实现 |
| Frontend-dev | 前端 UI、状态管理、接口对接 |
| Reviewer | 代码规范审查、架构合规性 |
| QA-engineer | 测试用例设计、质量卡点 |
| Memory | 长期记忆归档、关键决策持久化 |

## 流转规则

1. 每个任务必须落到 `docs/tasks/TASK-XXX.md`
2. Agent 交接必须通过文件落盘，不可仅靠上下文
3. 下游 Agent 读取上游产物文件后开始工作
4. REJECTED 超过 3 次 → BLOCKED，需 PMO 仲裁
5. BLOCKED 任务不可继续，必须降技术指标或改方案
