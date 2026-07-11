# ScopeGuard 代码审查报告

> 生成时间: 2026-07-01 | 审查范围: 47 个源文件

---

## 一、严重 Bug (Critical) — 安全/数据完整性

### BUG-001: deliverables 增删改缺少所有权验证 → IDOR

| 属性 | 值 |
|------|-----|
| 文件 | `lib/actions/deliverables.ts` |
| 行号 | L7-L32 (createDeliverable), L34-L49 (updateDeliverableStatus), L51-L73 (updateDeliverable), L75-L95 (deleteDeliverable), L97-L115 (reorderDeliverables) |
| 影响 | 任何登录用户可以修改、删除任意用户的交付物 |
| 严重级别 | **Critical** |

**问题**: 所有 deliverable 操作仅用 `eq('id', id)` 匹配记录，未验证该 deliverable 的 project 是否属于当前用户。

**示例 - createDeliverable**:
```typescript
// 只接收 projectId，未检查 project.user_id === user.id
const { data: deliverable, error } = await supabase
  .from('deliverables')
  .insert({ project_id: projectId, ... })
```

**修复建议**: 在操作前先验证 project 归属，或在 update/delete 时 JOIN project 表检查 `user_id`。

---

### BUG-002: scope-requests 增删改缺少所有权验证 → IDOR

| 属性 | 值 |
|------|-----|
| 文件 | `lib/actions/scope-requests.ts` |
| 行号 | L7-L35 (createScopeRequest), L52-L70 (updateScopeRequest), L72-L92 (deleteScopeRequest) |
| 影响 | 任何登录用户可以创建、修改、删除任意项目的 scope request |
| 严重级别 | **Critical** |

---

### BUG-003: change-orders 操作缺少所有权验证 → IDOR

| 属性 | 值 |
|------|-----|
| 文件 | `lib/actions/change-orders.ts` |
| 行号 | L7-L65 (createChangeOrder), L67-L83 (getChangeOrder), L85-L112 (sendChangeOrder), L114-L147 (getDeviationStats) |
| 影响 | 任何 Pro 用户可以操作任意项目的 change order |
| 严重级别 | **Critical** |

---

### BUG-004: Webhook 签名验证缺失 → 伪造支付

| 属性 | 值 |
|------|-----|
| 文件 | `app/api/lemonsqueezy/webhook/route.ts` |
| 行号 | L8-L10 |
| 影响 | 任何人可发送伪造 webhook 免费升级 Pro |
| 严重级别 | **Critical** |

```typescript
// TODO: verify webhook signature with crypto  ← 直接注释掉了
// const signature = request.headers.get('x-signature')
// const isValid = verifySignature(body, signature, secret)
```

---

### BUG-005: Webhook Route 运行时错误风险

| 属性 | 值 |
|------|-----|
| 文件 | `app/api/lemonsqueezy/webhook/route.ts` |
| 行号 | L15 |
| 影响 | 生产环境 webhook 可能因 `cookies()` 调用失败 |
| 严重级别 | **High** |

```typescript
const supabase = await createClient()  // createClient 内部调用 cookies()
// API Route 中 cookies() 可能抛出 DynamicServerError
```

---

## 二、高优先级 Bug (High)

### BUG-006: Free Plan 限制存在 TOCTOU Race Condition

| 属性 | 值 |
|------|-----|
| 文件 | `lib/actions/projects.ts` |
| 行号 | L32-L48 |
| 影响 | 两个并发请求可同时绕过 2 项目限制 |
| 严重级别 | **High** |

**问题**: `count` 查询和 `profile.plan` 查询之间无事务保护，时间窗口内可竞态。

---

### BUG-007: Middleware Cookie 设置丢失

| 属性 | 值 |
|------|-----|
| 文件 | `lib/supabase/middleware.ts` |
| 行号 | L16-L21 |
| 影响 | 多个 cookie 同时刷新时可能只保留最后一个，导致 session 丢失 |
| 严重级别 | **High** |

```typescript
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
  supabaseResponse = NextResponse.next({ request });  // ← 每次覆盖！
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options)
  );
},
```

每次 forEach 迭代都创建新的 `NextResponse`，前一次的 `set-cookie` header 被丢弃。正确做法是：循环外创建 response，循环内只调用 `response.cookies.set()`。

---

## 三、中优先级 Bug (Medium)

### BUG-008: 嵌套 Button 组件（非法 HTML）

| 属性 | 值 |
|------|-----|
| 文件 | `components/change-order-preview.tsx` |
| 行号 | L77-L79 |
| 影响 | HTML 不合规，可能触发浏览器怪异行为 |

```tsx
<Button variant="primary" size="sm">
  <UpgradeButton label="升级到 Pro · $4/月 ¥19/月" />
</Button>
```
`UpgradeButton` 内部渲染 `<Button>`，嵌套 `<button>` in `<button>`。

---

### BUG-009: useEffect 依赖数组不完整

| 属性 | 值 |
|------|-----|
| 文件 | `app/dashboard/page.tsx` |
| 行号 | L36 |
| 影响 | React 闭包陷阱，`router` 引用可能过期 |

```typescript
useEffect(() => { ... router.push('/login') ... }, [user, authLoading])
// `router` 缺失
```

---

### BUG-010: createProject 参数类型与 Zod schema 不一致

| 属性 | 值 |
|------|-----|
| 文件 | `lib/actions/projects.ts` vs `lib/utils/validators.ts` |
| 行号 | L7 vs L5 |
| 影响 | TypeScript 类型安全被绕过 |

`createProject` 签名中 `client_name?: string` 是 optional，但 `projectSchema` 要求 `min(1)`，调用时传 undefined 会在运行时被 Zod 拒绝。

---

## 四、低优先级问题 (Low)

### BUG-011: 环境变量 undefined 导致静默失败

| 属性 | 值 |
|------|-----|
| 文件 | `lib/lemonsqueezy.ts` |
| 行号 | L1-L3 |
| 影响 | 缺失环境变量时 checkout URL 变为 `https://undefined.lemonsqueezy.com/...` |

```typescript
const STORE_ID = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID  // 可能为 undefined
```

**建议**: 添加运行时校验并在失败时抛出明确错误。

---

### BUG-012: 创建项目时串行创建交付物

| 属性 | 值 |
|------|-----|
| 文件 | `app/projects/new/page.tsx` |
| 行号 | L34-L36 |
| 影响 | 性能差，N个交付物需要 N 次网络请求 |

```typescript
for (const name of deliverableNames) {
  await createDeliverable(newProject.id, { name })  // 串行！
}
```

**建议**: 使用 `Promise.all` 并行创建。

---

### BUG-013: 前端直接使用 client-side supabase 查询绕过 Server Action

| 属性 | 值 |
|------|-----|
| 文件 | `app/dashboard/page.tsx`, `app/projects/[id]/page.tsx`, `app/projects/[id]/requests/page.tsx`, `app/projects/[id]/change-order/page.tsx` |
| 影响 | 数据访问权限完全依赖 Supabase RLS，如果 RLS 配置不当则数据泄露 |

---

## 五、汇总

| ID | 严重度 | 类别 | 文件 |
|----|--------|------|------|
| BUG-001 | Critical | IDOR | deliverables.ts |
| BUG-002 | Critical | IDOR | scope-requests.ts |
| BUG-003 | Critical | IDOR | change-orders.ts |
| BUG-004 | Critical | 签名缺失 | webhook/route.ts |
| BUG-005 | High | 运行时错误 | webhook/route.ts |
| BUG-006 | High | TOCTOU | projects.ts |
| BUG-007 | High | Cookie 丢失 | middleware.ts |
| BUG-008 | Medium | 非法 HTML | change-order-preview.tsx |
| BUG-009 | Medium | 依赖遗漏 | dashboard/page.tsx |
| BUG-010 | Medium | 类型不一致 | projects.ts + validators.ts |
| BUG-011 | Low | 静默失败 | lemonsqueezy.ts |
| BUG-012 | Low | 性能 | projects/new/page.tsx |
| BUG-013 | Low | 架构 | 多个 page.tsx |
