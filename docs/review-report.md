# ScopeGuard 代码审查报告

> 审查日期：2026-06-29 | 审查范围：全量代码 | 审查人：reviewer

---

## Standards 评估

### BLOCKER

- **B1 - API 路由参数签名错误**
  - **文件**: `app/api/change-orders/[token]/route.ts:6`
  - **问题**: `params` 被声明为 `Promise<{ token: string }>` 并使用了 `await params`，这是 Next.js 15+ 的 API。项目 package.json 指定 `next: ^14.2.0`，Next.js 14 的 `params` 是同步对象，此写法会导致编译错误。
  - **建议**: 改为 `{ params }: { params: { token: string } }`，并直接使用 `params.token`。

- **B2 - 未登录页面对已认证用户无重定向**
  - **文件**: `app/(auth)/login/page.tsx:8`
  - **问题**: 架构文档规定 `/login` 路由应对已登录用户重定向到 `/dashboard`，但当前登录页未检查 auth 状态。已登录用户访问 `/login` 会看到登录表单。
  - **建议**: 在 `useEffect` 中检查 `user` 状态，若已登录则 `router.push('/dashboard')`。

### MAJOR

- **M1 - 多处数据变更使用浏览器端 Supabase 客户端绕过 Server Actions**
  - **文件**: `app/projects/new/page.tsx:27-62`、`app/projects/[id]/page.tsx:51-81`、`app/projects/[id]/requests/page.tsx:44-58`、`app/projects/[id]/change-order/page.tsx:39-64`
  - **问题**: 架构文档明确规定所有 CRUD 操作必须通过 Server Actions + Zod 验证。当前大量数据变更（创建项目、交付物 CRUD、标记需求、生成报价单）直接在 Client Component 中调用浏览器端 Supabase 客户端，绕过了：
    - Zod 输入验证
    - 服务端权限检查
    - 免费版项目数限制检查
    - Pro 功能服务端保护
    - 统一错误处理
  - **建议**: 将所有数据变更迁移到 `lib/actions/` 中的 Server Actions，各页面组件仅负责 UI 层调用。

- **M2 - Server Actions 缺少 Zod 输入验证**
  - **文件**: `lib/actions/projects.ts:6`、`lib/actions/deliverables.ts:6`、`lib/actions/scope-requests.ts:6`、`lib/actions/change-orders.ts:7`
  - **问题**: `lib/utils/validators.ts` 已定义了 `projectSchema`、`deliverableSchema`、`scopeRequestSchema`，但没有被任何 Server Action 引用。所有 Server Action 直接使用未经校验的 `data` 参数，违反了架构文档"所有 Server Actions 使用 Zod schema 验证输入"的要求。
  - **建议**: 在每个 Server Action 入口处调用对应的 Zod schema 进行 `safeParse` 校验，失败时抛出结构化错误。

- **M3 - `@supabase/ssr` 和 `@supabase/auth-helpers-nextjs` 混用**
  - **文件**: `lib/supabase/server.ts:1`、`app/(auth)/callback/route.ts:1`、`lib/supabase/middleware.ts:1`
  - **问题**: 项目同时依赖了两个 Supabase Auth 包（`@supabase/auth-helpers-nextjs` 和 `@supabase/ssr`）。`server.ts` 和 `callback/route.ts` 使用旧的 `auth-helpers-nextjs`（已弃用），`middleware.ts` 使用新的 `@supabase/ssr`。session 管理不一致可能导致 cookie 处理冲突。
  - **建议**: 统一使用 `@supabase/ssr`，用 `createServerClient` 替代 `createServerComponentClient` 和 `createRouteHandlerClient`，移除 `@supabase/auth-helpers-nextjs` 依赖。

- **M4 - 新建项目页面通过二次查询获取刚插入的数据**
  - **文件**: `app/projects/new/page.tsx:27-46`
  - **问题**: `handleSubmit` 中使用 `.select().single()` 进行 INSERT，但只析构了 `error` 忽略了返回的 `data`。随后通过 `user_id` + `order('created_at', {ascending: false}).limit(1)` 重新查找刚创建的项目。若存在并发，可能返回错误项目。
  - **建议**: 使用 `const { data: newProject, error: projectError } = ...` 直接获取 INSERT 返回的数据。

- **M5 - 项目详情页未在应用层校验项目归属**
  - **文件**: `app/projects/[id]/page.tsx:31`
  - **问题**: 查询项目时使用 `supabase.from('projects').select('*').eq('id', id).single()`，未添加 `.eq('user_id', user.id)` 过滤。完全依赖 RLS 策略，缺少应用层双重保障。若 RLS 配置失误，可能导致数据泄露。
  - **建议**: 在查询条件中加入 `user_id` 过滤，并在无结果时返回 404 或错误提示。

- **M6 - 生成报价单请求时没有对 Pro 计划做服务端校验**
  - **文件**: `app/projects/[id]/change-order/page.tsx:39-64`、`lib/actions/change-orders.ts:7`
  - **问题**: 变更报价单是 Pro 功能，但 Client Component 中直接调用 Supabase client 创建 `change_orders`，只在 UI 层隐藏了分享按钮。Server Action `createChangeOrder` 也未检查用户 plan。恶意用户可绕过 UI 直接调用 Supabase API 创建报价单。
  - **建议**: `createChangeOrder` 和 `sendChangeOrder` Server Action 中查询 `profiles.plan`，非 Pro 用户抛出拒绝错误。

- **M7 - `crypto.randomUUID()` 在 Edge Runtime 兼容性**
  - **文件**: `lib/actions/change-orders.ts:80`
  - **问题**: `crypto.randomUUID()` 在 Node.js 19+ 和现代浏览器中可用，但在 Next.js Edge Runtime 或低版本 Node.js 中可能不可用。项目部署在 Vercel 时可能使用 Edge Runtime。
  - **建议**: 使用 `crypto.randomUUID?.()` 并 fallback 到 `'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(...)` 模式，或直接移交给数据库默认值 `gen_random_uuid()`（删除 `share_token: null` 的显式赋值）。

- **M8 - Supabase 错误码直接硬编码**
  - **文件**: `lib/actions/change-orders.ts:70`
  - **问题**: `error.code === 'PGRST116'` 硬编码了 Supabase 内部错误码，缺少注释或常量定义，可维护性差。
  - **建议**: 提取为常量如 `const SUPABASE_NOT_FOUND = 'PGRST116'` 并添加注释说明。

### MINOR

- **m1 - `ShareToken` 在 DB 层和代码层生成策略不一致**
  - **文件**: `lib/actions/change-orders.ts:42,80`
  - **问题**: INSERT 时显式设置 `share_token: null` 强制覆盖了 DB 默认值 `gen_random_uuid()::text`，后续 `sendChangeOrder` 中才用 `crypto.randomUUID()` 生成。这会导致 `change_orders` 行在 draft 状态时 `share_token` 为 NULL。若审核日志需要追踪 draft 分享令牌，则无法追溯。
  - **建议**: 移除 INSERT 时的 `share_token: null`，让 DB 自动生成；`sendChangeOrder` 时保留已有 token 不再覆盖。

- **m2 - Client Component 的 `useState` 类型断言**
  - **文件**: `contexts/AuthContext.tsx:57`、`app/dashboard/page.tsx:32`、`app/projects/[id]/page.tsx:36-38`
  - **问题**: 多处使用 `data as Profile` / `data as Project` 等类型断言来绕过 Supabase 响应类型（`SupabaseClient` 返回 `SupabaseResponse<T>`）。运行时若字段不匹配，无法在编译期发现。
  - **建议**: 将类型断言改为 Zod schema 解析或 Supabase 类型生成工具（`supabase gen types typescript`）生成准确的 Database 类型。

- **m3 - 加载态无限循环风险**
  - **文件**: `app/projects/[id]/page.tsx:88-94`
  - **问题**: 加载判断为 `authLoading || loading || !project`，当用户无权访问项目时（project 为 null），组件会永久显示 spinner，不会降级为错误提示。
  - **建议**: 区分"加载中"和"数据不存在"状态，在 project 为 null 且非加载时显示 404 或错误提示。

- **m4 - `import { ReactNode }` 可简化**
  - **文件**: `app/projects/[id]/layout.tsx:1`
  - **问题**: 导入了 `ReactNode` 但定义为 `import { ReactNode } from 'react'`，可以使用 inline 类型 `children: React.ReactNode` 保持一致。

### INFO

- **i1** — `components/ui/card.tsx` 和 `badge.tsx` 未标记 `'use client'`，当前无交互逻辑，正确。
- **i2** — `lib/supabase/middleware.ts:16` 的 `supabaseResponse` 覆写模式是 `@supabase/ssr` 官方推荐做法，正确。
- **i3** — `.env.local.example` 缺少 `SUPABASE_SERVICE_ROLE_KEY`（架构文档已列出但非必需，INFO 级）。

---

## Spec 评估

### 验收标准逐项检查

| # | 验收标准 | 状态 | 说明 |
|---|---------|------|------|
| 1 | 创建项目并录入交付物列表，每项可标记状态 | ✓ | `projects/new/page.tsx` + `DeliverableList` |
| 2 | 标记需求为"合同内修订"或"超范围新增" | ✓ | `ScopeRequestForm` 支持 `is_out_of_scope` 切换 |
| 3 | 偏差看板：合同内进度、超范围数量/工时、**时间线对比** | ✗ | `DeviationDashboard` 缺少 PRD 要求的"原定范围 vs 实际交付"时间线对比 |
| 4 | Pro 用户一键生成变更报价单并分享链接 | ~ | 生成功能已实现（客户端）；分享链接标记为"即将上线"；PDF 导出未实现 |
| 5 | 免费用户可预览不可发送/分享 | ✓ | `ChangeOrderPreview` + `isPro` 判断 |
| 6 | 手机端和桌面端均可正常使用 | ✓ | 全站 `max-w-lg mx-auto` 响应式布局 |
| 7 | 新用户从注册到完成首个项目 ≤ 3 分钟 | ✓ | 3 步表单 + Magic Link 登录 |
| 8 | 免费版限制最多 2 个活跃项目 | ✓ | 服务端 (`projects.ts:31-41`) + 客户端 (`dashboard/page.tsx:38-39`) 双重检查 |

### 页面路由完整性

| 路由 | 文件 | 存在 | 权限保护 |
|------|------|------|---------|
| `/` | `app/page.tsx` | ✓ | 公开 |
| `/login` | `app/(auth)/login/page.tsx` | ✓ | 公开（应重定向已登录用户 → ✗） |
| `/callback` | `app/(auth)/callback/route.ts` | ✓ | 公开 |
| `/dashboard` | `app/dashboard/page.tsx` | ✓ | 中间件保护（必要） + 客户端二次检查 |
| `/projects/new` | `app/projects/new/page.tsx` | ✓ | 中间件保护 |
| `/projects/[id]` | `app/projects/[id]/page.tsx` | ✓ | 中间件保护 + 客户端检查 |
| `/projects/[id]/requests` | 存在 | ✓ | 中间件保护 |
| `/projects/[id]/change-order` | 存在 | ✓ | 中间件保护（缺失 Pro 服务端检查 ⚠️） |

**路由结果**: 6/6 路由存在 ✓。Auth 保护存在但 `/change-order` 缺少 Pro 服务端校验 ⚠️。

### 架构一致性

- 目录结构：基本符合 `architecture.md`，但缺少 `app/(auth)` 内部预期的 `layout.tsx` 子布局导航
- Server Actions vs Client-side mutations：架构规定全走 Server Actions，实际情况是 **几乎所有数据变更都走浏览器客户端** ⚠️
- Supabase 包混用（`auth-helpers-nextjs` + `ssr`）⚠️
- Zod 验证器已定义但未被 Server Actions 使用 ⚠️

---

## 总结

### 整体质量等级：**CONDITIONAL PASS**

> 项目处于概念验证阶段，UI/UX 实现完整度高，6 个路由全部就绪，三大 MVP 功能核心逻辑均存在。BUT 代码架构层面存在显著偏差，阻塞项需要修复后方可进入生产构建。

### 严重级别统计

| 级别 | 数量 | 说明 |
|------|------|------|
| **BLOCKER** | **2** | API 路由不兼容 Next.js 14（编译失败）、登录页缺少已用户重定向 |
| **MAJOR** | **8** | CRUD 绕过 Server Actions、Zod 校验未使用、Supabase 包混用、Pro 保护缺失等 |
| **MINOR** | **4** | 类型断言、加载态处理、二次查询、硬编码错误码 |
| **INFO** | **3** | 正确实践标注 |

### 必须修复（BLOCKER）

1. `app/api/change-orders/[token]/route.ts` — 将 `Promise<{ params }>` 改为 Next.js 14 同步 `params` 签名
2. `app/(auth)/login/page.tsx` — 添加已登录用户重定向到 `/dashboard`

### 建议优先修复（MAJOR）

1. 将所有 Client-side 数据变更迁移到 Server Actions（M1）
2. 在 Server Actions 中接入 Zod schema 验证（M2）
3. 统一使用 `@supabase/ssr` 替代 `@supabase/auth-helpers-nextjs`（M3）
4. `/change-order` 添加 Pro 计划服务端校验（M6）
5. 项目详情页查询添加 `user_id` 过滤（M5）

### 规格缺失（Spec Gaps）

1. **偏差看板**缺少"时间线对比"（原定范围 vs 实际交付）—— PRD 2.2 验收标准 #3
2. **变更报价单**的 PDF 导出和客户在线确认/协商未实现—— PRD 2.3
3. **分享链接**标注为"即将上线"，当前无实际分享功能—— PRD 2.3
4. **SSR + SPA** 混合渲染未落实，所有登录页面使用纯 Client Component 渲染—— PRD 非功能需求
