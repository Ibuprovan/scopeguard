# ScopeGuard OWASP 安全审计报告

> 生成时间: 2026-07-01 | 审计标准: OWASP Top 10:2021

---

## 一、严重漏洞 (Critical)

### SEC-001: Webhook 签名验证缺失 — 支付系统伪造 [CVSS 9.1]

| 属性 | 值 |
|------|-----|
| OWASP | A01:2021 Broken Access Control + A08:2021 Software and Data Integrity Failures |
| 文件 | `app/api/lemonsqueezy/webhook/route.ts` |
| 行号 | L8-L10 |
| CVSS Vector | AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:H |

**漏洞描述**: Lemon Squeezy Webhook 签名验证代码被注释掉，端点接受任何 POST 请求。

**攻击场景**:
1. 攻击者注册 ScopeGuard 免费账户
2. 攻击者 POST 到 `/api/lemonsqueezy/webhook`，发送伪造 JSON:
```json
{
  "meta": { "event_name": "subscription_created" },
  "data": {
    "attributes": {
      "user_email": "attacker@evil.com",
      "status": "active"
    }
  }
}
```
3. 服务器执行 `UPDATE profiles SET plan='pro' WHERE email='attacker@evil.com'`
4. 攻击者获得 Pro 权限，无需支付

**修复建议**:
```typescript
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

// 在 POST handler 中:
const signature = request.headers.get('x-signature');
if (!signature || !verifySignature(body, signature, secret)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

---

### SEC-002: 12+ IDOR 漏洞链 — 跨用户数据操纵 [CVSS 8.6]

| 属性 | 值 |
|------|-----|
| OWASP | A01:2021 Broken Access Control |
| CVSS Vector | AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:H |

**受影响操作**（所有 Server Actions）:

| 文件 | 行号 | 函数 | 缺失的校验 |
|------|------|------|-----------|
| `lib/actions/deliverables.ts` | L7-L32 | `createDeliverable` | 未验证 project.user_id === user.id |
| `lib/actions/deliverables.ts` | L34-L49 | `updateDeliverableStatus` | 未验证 deliverable 归属 |
| `lib/actions/deliverables.ts` | L51-L73 | `updateDeliverable` | 未验证 deliverable 归属 |
| `lib/actions/deliverables.ts` | L75-L95 | `deleteDeliverable` | 查了 project_id 但未验证 user_id |
| `lib/actions/deliverables.ts` | L97-L115 | `reorderDeliverables` | 未验证任何归属 |
| `lib/actions/scope-requests.ts` | L7-L35 | `createScopeRequest` | 未验证 project.user_id === user.id |
| `lib/actions/scope-requests.ts` | L52-L70 | `updateScopeRequest` | 未验证 scope request 归属 |
| `lib/actions/scope-requests.ts` | L72-L92 | `deleteScopeRequest` | 查了 project_id 但未验证 user_id |
| `lib/actions/change-orders.ts` | L7-L65 | `createChangeOrder` | 未验证 project.user_id === user.id |
| `lib/actions/change-orders.ts` | L67-L83 | `getChangeOrder` | 未验证 project.user_id === user.id |
| `lib/actions/change-orders.ts` | L85-L112 | `sendChangeOrder` | 未验证 project.user_id === user.id |
| `lib/actions/change-orders.ts` | L114-L147 | `getDeviationStats` | 未验证 project.user_id === user.id |

**攻击场景**: 攻击者登录后，获取任意 project_id（可通过 API 响应推断），直接调用 Server Action 修改/删除他人数据。

**修复建议**: 使用统一的 ownership guard 函数：
```typescript
async function verifyProjectOwnership(supabase: SupabaseClient, projectId: string, userId: string) {
  const { data } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();
  if (!data) throw new Error('Forbidden');
}
```

---

### SEC-003: Webhook Route 运行时失败风险 [CVSS 7.5]

| 属性 | 值 |
|------|-----|
| OWASP | A05:2021 Security Misconfiguration |
| 文件 | `app/api/lemonsqueezy/webhook/route.ts` |
| 行号 | L15 |
| CVSS | AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H |

**问题**: `await createClient()` 内部调用 Next.js `cookies()` 函数，在 API Route 上下文中可能抛出 `DynamicServerError`，导致 webhook 完全不可用。

**修复建议**: 使用 Supabase Service Role Key 直接实例化无状态客户端：
```typescript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

---

## 二、高危漏洞 (High)

### SEC-004: Free Plan 限制 TOCTOU Race Condition [CVSS 7.1]

| 属性 | 值 |
|------|-----|
| OWASP | A01:2021 Broken Access Control |
| 文件 | `lib/actions/projects.ts` |
| 行号 | L32-L48 |
| CVSS | AV:N/AC:H/PR:L/UI:N/S:U/C:N/I:H/A:N |

**问题**: `count` 查询和 `profile.plan` 查询之间无原子性保证，并发请求可绕过限制。

**攻击场景**: 同时发起 3 个 createProject 请求，每个都看到 count=1，全部通过检查。

**修复建议**: 使用 Supabase RLS 或数据库级 UNIQUE 约束 + 事务。

---

### SEC-005: Middleware Cookie 设置 Bug — Session 刷新失败 [CVSS 5.3]

| 属性 | 值 |
|------|-----|
| OWASP | A07:2021 Identification and Authentication Failures |
| 文件 | `lib/supabase/middleware.ts` |
| 行号 | L16-L21 |

**问题**: `forEach` 循环内每次创建新 `NextResponse`，前一次 set-cookie 丢失。

**修复**:
```typescript
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
  supabaseResponse = NextResponse.next({ request });
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options)
  );
},
```
→
```typescript
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
  supabaseResponse = NextResponse.next({ request });
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options)  // 只追加，不重建
  );
},
```

---

## 三、中危漏洞 (Medium)

### SEC-006: 错误信息泄露 [CVSS 4.3]

| 属性 | 值 |
|------|-----|
| OWASP | A05:2021 Security Misconfiguration |
| 文件 | 所有 `lib/actions/*.ts` |

Server Actions 直接 `throw new Error(...)` 将 Supabase 内部错误信息返回客户端，潜在泄露表结构、约束名等。

**修复**: 捕获并转换为用户友好的错误信息。

---

### SEC-007: API 端点无速率限制

| 属性 | 值 |
|------|-----|
| OWASP | A04:2021 Insecure Design |
| 文件 | `app/api/lemonsqueezy/webhook/route.ts`, `app/api/change-orders/[token]/route.ts` |

Webhook 端点和 share token 端点无速率限制，可能被暴力攻击或 DDoS。

---

### SEC-008: 前端依赖 RLS 但无验证层

| 属性 | 值 |
|------|-----|
| OWASP | A01:2021 Broken Access Control |
| 文件 | `app/dashboard/page.tsx`, `app/projects/[id]/page.tsx` 等 |

多个页面使用 client-side supabase 直接查询数据，完全依赖 Supabase RLS。如果 RLS 配置错误，用户可读取任意数据。

**建议**: 关键数据查询应通过 Server Actions 并做服务端权限验证。

---

## 四、汇总

| ID | OWASP | CVSS | 严重度 | 描述 |
|----|-------|------|--------|------|
| SEC-001 | A01+A08 | 9.1 | Critical | Webhook 签名验证缺失 |
| SEC-002 | A01 | 8.6 | Critical | 12+ IDOR 漏洞 |
| SEC-003 | A05 | 7.5 | High | Webhook Route 运行时错误 |
| SEC-004 | A01 | 7.1 | High | Free Plan TOCTOU |
| SEC-005 | A07 | 5.3 | Medium | Cookie 设置丢失 |
| SEC-006 | A05 | 4.3 | Medium | 错误信息泄露 |
| SEC-007 | A04 | 4.0 | Medium | 无速率限制 |
| SEC-008 | A01 | 3.1 | Low | 前端直连 Supabase |

---

## 五、修复优先级

1. **P0 (立即修复)**:
   - SEC-001: Webhook 签名验证
   - SEC-002: 所有 IDOR 漏洞（12+ 处）

2. **P1 (本周修复)**:
   - SEC-003: Webhook cookies() 问题
   - SEC-004: Free Plan TOCTOU
   - SEC-005: Middleware Cookie Bug

3. **P2 (下个迭代)**:
   - SEC-006: 错误信息规范化
   - SEC-007: 速率限制
   - SEC-008: 前端数据访问层加固
