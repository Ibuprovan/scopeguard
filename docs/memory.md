# ScopeGuard — 长期记忆文件

> 维护时间：2026-06-29 | 维护人：memory-agent

---

## 项目快照

| 项目 | 内容 |
|------|------|
| 项目名 | ScopeGuard（范围蔓延守卫） |
| 当前阶段 | MVP 开发完成（概念验证/pre-MVP） |
| 技术栈 | Next.js 14 (App Router) + Supabase + Tailwind CSS + TypeScript |
| 目标用户 | 华语自由职业者（设计师、开发者、文案、视频剪辑师） |
| 变现模式 | Freemium（2 个免费项目）→ ¥39/月 Pro |
| 核心理念 | 三个按钮，不是三百个 |
| 源码文件数 | 38（.tsx / .ts / .css / .js / .jsx） |
| 代码行数估算 | ~2266 行 |
| 总文件数（含文档） | 56 |

---

## 关键决策记录（ADR）

### ADR-001：技术栈
Next.js 14 (App Router) + Supabase + Tailwind CSS + TypeScript。不使用 Prisma（Supabase SDK 足够）、tRPC（Server Actions 替代）、Docker（Vercel Serverless）。

### ADR-002：数据变更方式
所有 CRUD 操作通过 **Server Actions**（而非 API Routes）实现。API Routes 仅用于外部分享链接（匿名用户查看报价单）。数据流：Client Component → Server Action (Zod 验证) → Supabase SDK → `revalidatePath`。

### ADR-003：Auth 方案
**Supabase Auth + Magic Link**。无密码登录，无社交登录。Session 管理由 `@supabase/ssr` 处理。

### ADR-004：Auth 中间件
使用 `@supabase/ssr` 的 `createMiddlewareClient` 保护 `/dashboard` 和 `/projects` 路由。已登录用户访问 `/login` 时重定向到 `/dashboard`。

### ADR-005：架构
**无 Prisma**，直接使用 Supabase JS SDK（服务端 `createServerClient` + 浏览器端 `createBrowserClient`）。RLS 行级安全作为数据隔离主防线，应用层做双重校验。

### ADR-006：部署
**Vercel** 零配置部署（Next.js 预设）。环境变量：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`。MVP 阶段手动在 Supabase SQL Editor 执行迁移。

### ADR-007：免费版限制
免费用户最多 **2 个活跃项目**。应用层（Server Action 中查询 count） + 数据库层（`BEFORE INSERT` 触发器）双重限制。

### ADR-008：单用户工具
**无团队/协作功能**。无多角色、无权限管理。所有数据按 `user_id` 隔离。

---

## 审查记录

### 审查结论
**CONDITIONAL PASS** — UI/UX 完整度高，6 个路由就绪，三大 MVP 功能核心逻辑存在。但架构层存在显著偏差需修复。

### 已修复的 6 项问题（TASK-007）

| ID | 问题 | 严重级别 |
|----|------|---------|
| B1 | API 路由参数签名与 Next.js 14 不兼容（`Promise<params>` → 同步 `params`） | BLOCKER |
| B2 | 登录页缺少已登录用户重定向（已添加 `useEffect` 检查） | BLOCKER |
| M1 | Client-side Supabase 绕过 Server Actions（迁移至 `lib/actions/`） | MAJOR |
| M2 | Server Actions 缺少 Zod 验证（接入 `validators.ts` 的 schema） | MAJOR |
| M3 | `@supabase/ssr` 和 `@supabase/auth-helpers-nextjs` 混用（统一为 `@supabase/ssr`） | MAJOR |
| M6 | 变更报价单缺少 Pro 计划服务端校验（`createChangeOrder` 中查询 `profiles.plan`） | MAJOR |

### 未修复的 MAJOR 清单

| ID | 问题 | 文件 |
|----|------|------|
| M5 | 项目详情页缺少 `user_id` 过滤 | `app/projects/[id]/page.tsx:33` |
| M7 | `crypto.randomUUID()` Edge Runtime 兼容性 | `lib/actions/change-orders.ts:100` |
| M8 | Supabase 错误码硬编码 `'PGRST116'` | `lib/actions/change-orders.ts:80` |

### 未修复的 MINOR 清单

| ID | 问题 | 文件 |
|----|------|------|
| m1 | `share_token: null` 覆盖 DB 默认值 | `lib/actions/change-orders.ts:52` |
| m2 | `useState` 类型断言绕过编译期检查 | 多处 |
| m3 | 加载态无限循环风险（非法 project id 永久 spinner） | `app/projects/[id]/page.tsx:82-87` |
| m4 | `ReactNode` 导入可简化 | `app/projects/[id]/layout.tsx:1` |

---

## 测试记录

### 测试结论
**CONDITIONAL PASS** — 22 个测试用例：14 ✅ 通过、5 ⚠️ 条件通过、3 ❌ 失败、2 — 无法验证。

### 已知 Spec Gaps

| ID | 缺失规格 | PRD 引用 | 严重程度 |
|----|---------|---------|---------|
| SG1 | 偏差看板缺少"原定范围 vs 实际交付"时间线对比 | §2.2 验收标准 #3 | MAJOR |
| SG2 | 变更报价单 PDF 导出未实现 | §2.3 | MINOR |
| SG3 | 分享链接标注"即将上线"，无实际分享功能 | §2.3 | MAJOR |
| SG4 | SSR + SPA 混合渲染未落实，所有登录页为纯 Client Component | §5 非功能需求 | MINOR |

### 阻碍项（必须修复后方可进入下一阶段）

1. **B1** — API 路由参数签名与 Next.js 14 不兼容（已修复，需验证编译通过）
2. **M3** — Supabase 包混用可能导致 cookie/Session 不一致（已修复，需验证统一后无冲突）
3. **SG1** — 时间线对比是 PRD 核心卖点的视觉锚点，缺失影响用户体验完整性
4. **M5** — 项目详情页缺少 `user_id` 过滤，RLS 失效时存在数据泄露风险

---

## 工作流总结

### 任务完成度
**8/8** 全部 DONE

### 各阶段消耗的 agent 类型

| 任务 | 阶段 | 责任人 | 结果 |
|------|------|--------|------|
| TASK-001 | PRD 编写 | pm → **general** | pm 2 轮失败，general 完成 |
| TASK-002 | 架构设计 | architect → **general** | architect 写入失败，general 完成 |
| TASK-003 | 数据库建模 | dba → **general** | dba→general 完成 |
| TASK-004 | 后端实现 | backend-dev → **general** | backend-dev 首轮无产出，general 完成 |
| TASK-005 | 前端实现 | frontend-dev → **general** | frontend-dev 首轮无产出，general 完成 |
| TASK-006 | 代码审查 | **general** | 直接完成 |
| TASK-007 | 问题修复 | **general** | 6 项修复 |
| TASK-008 | 质量测试 | qa-engineer → **general** | qa-engineer→general 完成 |

**规律**：所有领域专用 agent（pm/architect/dba/backend-dev/frontend-dev/qa-engineer）均无法产出实质代码/文档，最终由 **general** agent 兜底完成全部 8 个任务。
