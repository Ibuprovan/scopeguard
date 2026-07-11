# ScopeGuard — 架构设计文档

> 版本：v0.1｜状态：DRAFT｜更新：2026-06-29

---

## 1. 技术选型总结

| 层级 | 选型 | 说明 |
|------|------|------|
| 框架 | Next.js 14 (App Router) | SSR + RSC + Server Actions |
| 数据库 | Supabase (PostgreSQL) | 托管数据库，内置 Auth |
| 认证 | Supabase Auth | Magic Link 无密码登录 |
| ORM/查询 | Supabase JS SDK（服务端/浏览器客户端） | 直接查询，不引入 Prisma |
| 部署 | Vercel | 零配置部署，边缘函数支持 |
| 样式 | Tailwind CSS | 原子化 CSS，快速迭代 |
| 语言 | TypeScript | 全栈类型安全 |

不使用的技术：Prisma（Supabase SDK 足够）、tRPC（Server Actions 替代）、Docker（Vercel Serverless）。

---

## 2. 项目目录结构

```
scopeguard/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx            — 登录/注册页
│   │   └── callback/
│   │       └── route.ts            — Auth callback
│   ├── dashboard/
│   │   └── page.tsx                — 项目概览仪表盘
│   ├── projects/
│   │   ├── new/
│   │   │   └── page.tsx            — 新建项目（范围设定器）
│   │   ├── [id]/
│   │   │   ├── page.tsx            — 项目详情 + 偏差看板
│   │   │   ├── requests/
│   │   │   │   └── page.tsx        — 需求标记列表
│   │   │   └── change-order/
│   │   │       └── page.tsx        — 变更报价单（Pro）
│   ├── layout.tsx                  — 根布局（含 AuthProvider）
│   └── page.tsx                    — 首页/落地页（公开）
├── components/
│   ├── project-form.tsx            — 新建项目表单
│   ├── deliverable-list.tsx        — 交付物列表（可编辑/标记状态）
│   ├── scope-request-form.tsx      — 标记需求弹窗
│   ├── deviation-dashboard.tsx     — 偏差看板（核心组件）
│   ├── change-order-preview.tsx    — 报价单预览/编辑
│   └── ui/                         — 通用 UI 组件
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── progress-bar.tsx
│       ├── modal.tsx
│       └── ...
├── lib/
│   ├── supabase/
│   │   ├── client.ts               — 浏览器端 Supabase 客户端
│   │   └── server.ts               — 服务端 Supabase 客户端
│   └── utils/
│       ├── format.ts               — 金额/时间格式化
│       └── validators.ts           — 输入验证函数
├── types/
│   └── index.ts                    — 共享类型定义
└── middleware.ts                   — Auth 路由保护
```

---

## 3. 路由设计

使用 Route Group `(auth)` 隔离登录流程，与主应用共享根布局。

| Route Group | 路径 | 页面 | 布局 | 权限 |
|-------------|------|------|------|------|
| 公开 | `/` | 首页落地页 | `app/layout.tsx` | 公开 |
| `(auth)` | `/login` | 登录页 | `app/(auth)/layout.tsx` | 匿名 |
| `(auth)` | `/callback` | Auth 回调 | `app/(auth)/layout.tsx` | 匿名 |
| — | `/dashboard` | 项目概览 | `app/layout.tsx` | 登录 |
| — | `/projects/new` | 新建项目 | `app/layout.tsx` | 登录 |
| — | `/projects/[id]` | 项目详情 | `app/layout.tsx` | 登录 |
| — | `/projects/[id]/requests` | 需求列表 | `app/layout.tsx` | 登录 |
| — | `/projects/[id]/change-order` | 变更报价 | `app/layout.tsx` | 登录 + Pro |

布局嵌套关系：

```
app/layout.tsx (AuthProvider + 全局样式)
├── app/(auth)/layout.tsx (匿名用户专用布局)
│   ├── app/(auth)/login/page.tsx
│   └── app/(auth)/callback/route.ts
├── app/dashboard/page.tsx
├── app/projects/new/page.tsx
└── app/projects/[id]/layout.tsx (项目上下文布局)
    ├── app/projects/[id]/page.tsx
    ├── app/projects/[id]/requests/page.tsx
    └── app/projects/[id]/change-order/page.tsx
```

---

## 4. 组件树

### 首页 (`/`)
- `HeroSection` — 产品介绍
- `FeatureCards` — 3 个 MVP 功能概览
- `PricingSection` — 免费 vs Pro 对比

### 登录 (`/login`)
- `LoginForm` — 输入邮箱，发送 Magic Link
- `MagicLinkSent` — 提示查看邮箱

### 仪表盘 (`/dashboard`)
- `ProjectList` — 项目卡片列表
- `ProjectCard` — 单项目缩略信息（名称、进度、超范围计数）
- `CreateProjectButton` — 跳转新建项目
- `PlanBadge` — 显示当前套餐/剩余免费项目数

### 新建项目 (`/projects/new`)
- `ProjectForm` — 项目名称 + 客户名称 + 时薪
- `DeliverableInput` — 交付物文本输入（逐行添加）
- `DeliverableList` — 已录入交付物预览（可删除）

### 项目详情 (`/projects/[id]`)
- `ProjectHeader` — 项目名称 + 状态切换
- `DeliverableList` — 交付物清单（可标记状态、编辑、删除）
- `DeviationDashboard` — 偏差看板核心组件
  - `ProgressSummary` — 合同内进度（X/Y 项，完成度 Z%）
  - `OverscopeSummary` — 超范围统计（A 项，B 小时）
  - `TimelineComparison` — 原定范围 vs 实际交付时间线
- `AddScopeRequestButton` — 浮动按钮，打开标记弹窗
- `ScopeRequestForm` — 弹窗表单（需求描述、估算工时、是否超范围）

### 需求列表 (`/projects/[id]/requests`)
- `RequestList` — 所有标记记录（按时间倒序）
- `RequestItem` — 单条需求（描述、状态、是否超范围标签）
- `RequestFilter` — 筛选（全部/超范围/合同内）

### 变更报价单 (`/projects/[id]/change-order`)
- `ChangeOrderPreview` — 报价单内容（需求列表 + 单价 + 合计）
- `LineItemRow` — 单行报价条目（可编辑报价金额）
- `ShareButton` — 生成分享链接（Pro）
- `ShareLinkDisplay` — 复制链接或发送邮件
- `PaywallOverlay` — 免费版预览遮罩

---

## 5. 数据流

### 核心原则

```
Server Components (默认渲染)
  └── 数据来源: Supabase 服务端客户端 (createServerComponentClient)
  └── 用途: 页面初始数据、SEO 友好

Server Actions (数据变更)
  └── 用途: 所有 CRUD 操作（创建项目、标记需求、生成报价）
  └── 验证: Zod schema + 服务端校验
  └── 重定向: revalidatePath + redirect

API Routes (仅分享链接)
  └── 用途: /api/share/[token] — 客户查看报价单（无需登录）
  └── 数据来源: Supabase 浏览器端客户端 (createBrowserClient)

Supabase 浏览器端客户端
  └── 用途: 仅公开分享页面
  └── 不用于: 登录后页面（全部走服务端）
```

### 数据流示例：标记超范围需求

```
用户点击"标记超范围" → 填写 ScopeRequestForm
  → 调用 Server Action (scope-request/create.ts)
    → Zod 验证输入
    → 服务端 Supabase 客户端 INSERT scope_requests
    → revalidatePath(/projects/[id])
  → Server Component 重新渲染 DeviationDashboard
    → 查询 deliverables + scope_requests 聚合计算
    → 返回新看板数据
```

### 数据流示例：生成变更报价单

```
用户点击"生成变更报价单"
  → Server Action (change-order/create.ts)
    → 查询所有 is_out_of_scope = true 的 scope_request
    → 聚合为 jsonb items
    → 生成 UUID share_token
    → INSERT change_orders
    → redirect(/projects/[id]/change-order)
```

---

## 6. Supabase 集成

### 服务端客户端（用于 SSR）

```typescript
// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export function createClient() {
  return createServerComponentClient({ cookies })
}
```

用途：`app/dashboard/page.tsx`、`app/projects/[id]/page.tsx` 等所有登录后页面。

### 浏览器端客户端（用于公开页）

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

用途：仅 `/projects/[id]/change-order` 的公开分享视图（通过 share_token 访问时）。

### RLS 策略

所有表启用 Row Level Security，策略按 `user_id` 过滤：

```sql
-- projects: user_id = auth.uid()
-- deliverables: project_id IN (user's projects)
-- scope_requests: project_id IN (user's projects)
-- change_orders: project_id IN (user's projects) OR share_token = param
```

RLS 例外：`change_orders` 表允许通过 `share_token` 读取（匿名用户查看报价单）。

---

## 7. 认证

### 方案：Supabase Auth + Magic Link

- 无密码登录，用户输入邮箱即发送登录链接
- 无社交登录（保持极简）
- Session 管理由 `@supabase/auth-helpers-nextjs` 自动处理

### middleware.ts 保护规则

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

const protectedPaths = ['/dashboard', '/projects']

export async function middleware(req) {
  // 检查 session，无 session 重定向到 /login
}
```

| 路径 | 处理 |
|------|------|
| `/` | 公开 |
| `/login` | 已登录用户重定向到 `/dashboard` |
| `/callback` | 公开（Auth 回调） |
| `/dashboard/*` | 需登录 |
| `/projects/*` | 需登录 |

---

## 8. 数据模型（PostgreSQL 映射）

### profiles

| 列 | 类型 | 约束 |
|----|------|------|
| id | uuid | PK → auth.users.id |
| email | text | NOT NULL |
| name | text | |
| plan | text | CHECK (plan IN ('free', 'pro')), DEFAULT 'free' |
| created_at | timestamptz | DEFAULT now() |

### projects

| 列 | 类型 | 约束 |
|----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | NOT NULL → profiles.id |
| name | text | NOT NULL |
| client_name | text | NOT NULL |
| hourly_rate | decimal | NOT NULL |
| status | text | CHECK (status IN ('active', 'completed', 'archived')), DEFAULT 'active' |
| created_at | timestamptz | DEFAULT now() |

### deliverables

| 列 | 类型 | 约束 |
|----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| project_id | uuid | NOT NULL → projects.id ON DELETE CASCADE |
| name | text | NOT NULL |
| description | text | |
| status | text | CHECK (status IN ('pending', 'in_progress', 'completed')), DEFAULT 'pending' |
| sort_order | integer | DEFAULT 0 |
| created_at | timestamptz | DEFAULT now() |

### scope_requests

| 列 | 类型 | 约束 |
|----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| project_id | uuid | NOT NULL → projects.id ON DELETE CASCADE |
| description | text | NOT NULL |
| estimated_hours | decimal | |
| is_out_of_scope | boolean | DEFAULT true |
| status | text | CHECK (status IN ('pending', 'included_in_quote', 'quoted')), DEFAULT 'pending' |
| created_at | timestamptz | DEFAULT now() |

### change_orders

| 列 | 类型 | 约束 |
|----|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| project_id | uuid | NOT NULL → projects.id ON DELETE CASCADE |
| items | jsonb | DEFAULT '[]' |
| total_amount | decimal | |
| status | text | CHECK (status IN ('draft', 'sent', 'acknowledged', 'negotiated')), DEFAULT 'draft' |
| share_token | text | UNIQUE, DEFAULT gen_random_uuid()::text |
| created_at | timestamptz | DEFAULT now() |

---

## 9. 部署

| 项目 | 内容 |
|------|------|
| 平台 | Vercel |
| 框架预设 | Next.js |
| 环境变量 | `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY` |
| 数据库迁移 | 手动在 Supabase SQL Editor 执行（MVP 阶段） |
| 自定义域名 | 后期配置 |
| Docker | 不需要 |

---

## 10. 安全

### RLS 行级安全

- 所有用户数据表（projects, deliverables, scope_requests）按 `user_id` 隔离
- `INSERT` 时强制 `user_id = auth.uid()`
- `SELECT`/`UPDATE`/`DELETE` 时要求 `user_id = auth.uid()`

### 分享链接安全

- `share_token` 使用 PostgreSQL `gen_random_uuid()` 生成，不可预测
- 匿名用户通过 `share_token` 仅有 `SELECT` 权限（RLS 策略例外）
- 不暴露项目 ID 或用户 ID

### Server Actions 输入验证

- 所有 Server Actions 使用 Zod schema 验证输入
- 验证内容包括：必填字段、类型、长度限制、枚举值
- 与服务端 RLS 策略双重保障

### 其他

- 免费版项目数限制：Server Action 中查询当前活跃项目数，≥ 2 时拒绝创建
- Pro 功能保护：在 Server Components 中检查用户 plan，非 Pro 隐藏 UI 或返回 404
- 敏感操作（删除项目）需确认，不提供批量删除
