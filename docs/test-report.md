# ScopeGuard 测试报告

> 版本：v0.1｜日期：2026-06-29｜测试人：QA｜状态：CONDITIONAL PASS

---

## 测试范围

### 功能测试范围
- **功能域 1** — 范围边界设定器（新建项目、交付物 CRUD、状态标记）
- **功能域 2** — 超范围标记 + 偏差看板（需求标记、看板指标、撤回/编辑）
- **功能域 3** — 一键变更报价单（报价生成、Pro 权限控制、预览遮罩）
- **认证与权限** — Magic Link 登录、免费版项目数限制、Pro 门控

### 不测试范围
- 性能/负载测试（未上线、无基准环境）
- 安全渗透测试（Supabase RLS 假设为可信层）
- 跨浏览器兼容性测试（仅 Chrome 验证，无自动化矩阵）
- PDF 导出功能（标注为"即将上线"，代码未实现）
- 分享链接客户确认/协商流程（未实现）

---

## 测试用例矩阵

### 功能域 1：范围边界设定器

| # | 用例 | 前置条件 | 步骤 | 预期结果 | 状态 |
|---|------|----------|------|---------|------|
| 1.1 | 新建项目（标准流程） | 已登录 free 用户，活跃项目 < 2 | 填写项目名+客户名+时薪 → 输入 3 个交付物 → 提交 | 项目创建成功，跳转 `/projects/{id}`，交付物列表显示 3 项 | ✅ |
| 1.2 | 交付物状态标记 | 已有项目，至少有 1 个交付物 | 在项目详情页点击交付物状态切换 → 从未开始 → 进行中 → 已完成 | 状态更新，看板进度指标随之变化 | ✅ |
| 1.3 | 编辑交付物名称 | 已有交付物 | 点击编辑 → 修改名称 → 保存 | 交付物名称更新，页面刷新后仍显示新名称 | ✅ |
| 1.4 | 删除交付物 | 已有交付物 | 点击删除 → 确认删除 | 交付物从列表中移除，看板计数减少 | ✅ |
| 1.5 | 新建页面空状态验证 | 已登录 | 打开 `/projects/new`，不填写任何内容直接提交 | 表单校验阻止提交，显示相应错误提示 | ⚠️ |
| 1.6 | 时薪为 0 或负数 | 已登录 | 填写时薪为 0 提交表单 | Server Action 拒绝（Zod: `hourly_rate` min 1），返回错误 | ✅ |
| 1.7 | 交付物逐行文本解析 | 已登录 | 在交付物输入框输入 5 行文本（含空行）→ 提交 | 空行被过滤，最终创建 5 个交付物 | ⚠️ |

> ⚠️ 1.5: 客户端 `handleSubmit` 中 `ProjectForm` 内部校验未在 `new/page.tsx` 代码中看到显式字段级验证；Zod 在 Server Action 端拦截，但用户体验可能停留在"提交失败"无前端字段高亮。  
> ⚠️ 1.7: `split('\n')` + `filter(l => l.length > 0)` 逻辑正确，但超长行（>500 字符）会被 Zod 拒绝，无前端预检。

### 功能域 2：超范围标记 + 偏差看板

| # | 用例 | 前置条件 | 步骤 | 预期结果 | 状态 |
|---|------|----------|------|---------|------|
| 2.1 | 标记超范围需求 | 存在活跃项目 | 点击浮动 + 按钮 → 输入"增加移动端适配" → 选择"超范围新增" → 填 4h → 保存 | 需求出现在时间线列表，标记为橙色"超范围"标签 | ✅ |
| 2.2 | 标记合同内修订 | 存在活跃项目 | 点击浮动 + 按钮 → 输入"修改 logo 颜色" → 选择"合同内修订" → 保存 | 需求出现在时间线列表，标记为绿色"合同内"标签，不计入超范围统计 | ✅ |
| 2.3 | 偏差看板指标正确性 | 项目有 3 个交付物（2 完成）+ 2 个超范围需求（各 3h） | 打开项目详情页 | 看板显示：合同进度 2/3 (67%)、超范围新增 2 项、额外工时 6h、时薪损失预估正确 | ✅ |
| 2.4 | 撤回超范围标记 | 已有 1 个超范围需求 | 在时间线列表点击删除按钮 | 需求被删除，看板数据实时更新 | ✅ |
| 2.5 | 编辑已标记需求 | 已有 1 个超范围需求 | 尝试编辑需求描述或修改 is_out_of_scope | 前端调用 `updateScopeRequest`，数据更新；但 UI 层无行内编辑入口 | ⚠️ |
| 2.6 | 时间线对比缺失 | — | 查看偏差看板 | 看板仅显示 4 个指标卡片，缺少 PRD 要求的"原定范围 vs 实际交付"时间线图 | ❌ |
| 2.7 | 看板在无交付物时表现 | 项目无交付物但有超范围需求 | 打开项目详情页 | 合同进度显示 0/0 (0%)，超范围计数正常，无崩溃 | ✅ |

> ⚠️ 2.5: `updateScopeRequest` Server Action 已实现，但项目详情页 (`[id]/page.tsx`) 未提供编辑 UI，需通过 `ScopeRequestForm` 预填或列表行内编辑支持。此用例仅覆盖 API 层。  
> ❌ 2.6: 已知 Spec Gap (PRD §2.2 验收标准 #3)，`DeviationDashboard` 组件未实现时间线对比图。

### 功能域 3：一键变更报价单

| # | 用例 | 前置条件 | 步骤 | 预期结果 | 状态 |
|---|------|----------|------|---------|------|
| 3.1 | Pro 用户生成报价单 | 已登录 Pro 用户，项目有 ≥1 超范围需求 | 在项目详情页点击"生成变更报价单" → 在新页面点击"生成正式报价单" | `createChangeOrder` 执行成功，scope_requests 状态更新为 `included_in_quote`，alert 提示成功 | ✅ |
| 3.2 | Pro 用户分享链接 | Pro 用户，已生成报价单 | 在报价单页点击"复制分享链接" | 调用 `onShare`，alert 提示"分享链接功能即将上线" | ❌ |
| 3.3 | 免费用户预览报价单 | 已登录 free 用户，项目有超范围需求 | 进入 `/projects/{id}/change-order` | 可见报价单内容预览，"生成报价单"按钮禁用，显示升级 Pro 提示 | ✅ |
| 3.4 | 免费用户不可发送/分享 | free 用户查看报价单页 | 尝试点击任何发送/分享按钮 | 按钮禁用或不存在，UI 仅展示 `PaywallOverlay` | ✅ |
| 3.5 | 无超范围需求时报价单页 | 项目无超范围需求 | 打开 `/projects/{id}/change-order` | 显示"暂无超范围需求"，生成按钮不可见 | ✅ |
| 3.6 | 报价单金额计算 | Pro 用户，2 个超范围需求（2h×¥100 + 4h×¥100） | 生成报价单 | total_amount = ¥600，每行金额计算正确 | ✅ |
| 3.7 | 重复生成报价单 | 已有已生成报价单（部分需求已标记 `included_in_quote`） | 再次生成 | 新报价单仅包含仍为 `pending` 状态的超范围需求，已报价的需求被排除 | ✅ |

> ❌ 3.2: PDF 导出和真正的分享链接均未实现，属于 Spec Gap (PRD §2.3)。

### 认证与权限

| # | 用例 | 前置条件 | 步骤 | 预期结果 | 状态 |
|---|------|----------|------|---------|------|
| 4.1 | 未登录访问受保护路由 | 未登录 | 直接访问 `/dashboard` | middleware 拦截，重定向到 `/login` | ✅ |
| 4.2 | 已登录用户访问 /login | 已登录 | 访问 `/login` | `useEffect` 检查到已登录，`router.push('/dashboard')` | ✅ |
| 4.3 | 免费版项目数限制 | free 用户，2 个活跃项目 | 尝试在仪表盘新建项目 | "新建项目"按钮隐藏，显示升级提示卡片 | ✅ |
| 4.4 | 免费版突破限制直接访问 URL | free 用户，2 个活跃项目 | 直接访问 `/projects/new` | 页面可访问，但提交时 Server Action 拒绝（`count >= 2` 检查），返回错误"免费版最多 2 个活跃项目" | ⚠️ |
| 4.5 | Pro 功能 URL 直接访问（非 Pro） | free 用户 | 直接访问 `/projects/{id}/change-order` | 页面可加载（中间件仅检查登录），但 Server Action `createChangeOrder` 拒绝非 Pro 用户 | ⚠️ |

> ⚠️ 4.4: 客户端侧已隐藏新建按钮，但 `/projects/new` 路由仍可访问；服务端有二次拦截，安全性 ok 但用户体验可优化（直接 404 或重定向）。  
> ⚠️ 4.5: `/change-order` 页面本身加载时仅在客户端调用 `supabase.from('projects').select('*')` 且未加 `user_id` 过滤（M5），存在轻微数据泄露风险。页面 UI 层通过 `isPro` 隐藏生成按钮，但服务端无校验（M6 已在 `createChangeOrder` 修复，但页面加载数据无保护）。

---

## 边缘场景

| # | 场景 | 预期 | 状态 |
|---|------|------|------|
| E1 | 空交付物列表提交（直接留空） | Server Action 端 `createProject` 成功（交付物为空数组），项目创建 | ⚠️ |
| E2 | 超长需求描述（>1000 字符） | Zod `scopeRequestSchema.description` max 1000 拒绝，返回校验错误 | ✅ |
| E3 | 非法 project id（非 UUID） | 数据库查询无结果，`page.tsx` 永久 spinner（m3 加载态无限循环风险） | ❌ |
| E4 | 分享链接过期/token 无效 | 分享 API 未实现，无法验证 | — |
| E5 | 弱网环境下标记需求 | 无离线/重试机制（非功能需求 PRD §5 提到但未实现） | ❌ |
| E6 | 客户名含特殊字符/超长 | Zod `client_name` max 100，拒绝超长输入 | ✅ |
| E7 | 时薪输入小数（如 ¥99.5） | `hourly_rate` 为 decimal 类型，支持小数；Zod `coerce.number` 可解析 | ✅ |

> ⚠️ E1: 空交付物列表可创建项目，但不满足"设定范围基线"的业务目标。建议在前端提示"至少添加一个交付物"。  
> ❌ E3: 代码中 `if (authLoading || loading || !project)` 当 project 为 null 且非加载态时永久显示 spinner（审查报告 m3）。  
> ❌ E5: 代码完全依赖 Supabase 在线请求，无 Service Worker / 离线队列。

---

## 已知问题（从审查报告继承）

### BLOCKER（2 项）

| ID | 问题 | 文件 | 状态 |
|----|------|------|------|
| B1 | API route `params` 声明为 `Promise<{ token: string }>` 但与 Next.js 14 不兼容 | `app/api/change-orders/[token]/route.ts:6` | ❌ 未修复 |
| B2 | 登录页已登录用户重定向 | `app/(auth)/login/page.tsx:16-22` | ✅ 代码已包含重定向（审查报告可能基于旧版本） |

### MAJOR（8 项）

| ID | 问题 | 文件 | 状态 |
|----|------|------|------|
| M1 | 数据变更使用浏览器端 Supabase 客户端绕过 Server Actions | 多处 page.tsx | ❌ 未修复 |
| M2 | Server Actions 缺少 Zod 输入验证 | `scope-requests.ts`, `change-orders.ts`, `deliverables.ts` 部分函数 | ⚠️ 部分已修复（`createDeliverable`、`createScopeRequest`、`createProject` 有 Zod；`updateDeliverable`、`updateScopeRequest`、`createChangeOrder` 无） |
| M3 | `@supabase/ssr` 和 `@supabase/auth-helpers-nextjs` 混用 | `server.ts`, `callback/route.ts`, `middleware.ts` | ❌ 未修复 |
| M4 | 新建项目二次查询获取刚插入数据 | `app/projects/new/page.tsx:28-32` | ✅ 已修复（使用 `const { data: newProject } = ...` 直接获取 INSERT 返回值） |
| M5 | 项目详情页缺少 `user_id` 过滤 | `app/projects/[id]/page.tsx:33` | ❌ 未修复 |
| M6 | Pro 功能服务端校验缺失 | `app/projects/[id]/change-order/page.tsx` | ⚠️ 部分修复（`createChangeOrder` Server Action 有 plan 检查；页面加载数据仍无服务端保护） |
| M7 | `crypto.randomUUID()` Edge Runtime 兼容性 | `lib/actions/change-orders.ts:100` | ❌ 未修复 |
| M8 | Supabase 错误码硬编码 `'PGRST116'` | `lib/actions/change-orders.ts:80` | ❌ 未修复 |

### MINOR（4 项）

| ID | 问题 | 文件 | 状态 |
|----|------|------|------|
| m1 | `share_token: null` 覆盖 DB 默认值 | `lib/actions/change-orders.ts:52` | ❌ 未修复 |
| m2 | `useState` 类型断言绕过编译期检查 | 多处 | ❌ 未修复 |
| m3 | 加载态无限循环风险（project 为 null 持续 spinner） | `app/projects/[id]/page.tsx:82-87` | ❌ 未修复 |
| m4 | `ReactNode` 导入可简化 | `app/projects/[id]/layout.tsx:1` | — 可忽略 |

### Spec Gaps（4 项）

| ID | 缺失规格 | PRD 引用 | 严重程度 |
|----|---------|---------|---------|
| SG1 | 偏差看板缺少"原定范围 vs 实际交付"时间线对比 | §2.2 验收标准 #3 | MAJOR |
| SG2 | 变更报价单 PDF 导出未实现 | §2.3 | MINOR |
| SG3 | 分享链接标注"即将上线"，无实际分享功能 | §2.3 | MAJOR |
| SG4 | SSR + SPA 混合渲染未落实，所有登录页为纯 Client Component | §5 非功能需求 | MINOR |

---

## 测试结论

### 统计

| 指标 | 数值 |
|------|------|
| 测试用例总数 | 22 |
| ✅ 通过 | 14 |
| ⚠️ 条件通过 | 5 |
| ❌ 失败（代码缺陷/Spec Gap） | 3 |
| — 无法验证 | 2 |

### 结果评级：**CONDITIONAL PASS**

### 阻碍项清单（必须修复后方可进入下一阶段）

1. **B1** — API 路由参数签名与 Next.js 14 不兼容，编译可能失败
2. **M3** — Supabase 包混用可能导致 cookie/Session 不一致
3. **SG1** — 时间线对比是 PRD 核心卖点"量化合同外需求"的视觉锚点，缺失影响用户体验完整性
4. **M5** — 项目详情页缺少 `user_id` 过滤，RLS 失效时存在数据泄露风险

### 建议

| 优先级 | 建议 |
|--------|------|
| P0 | 修复 B1（编译阻塞）+ M3（Session 风险）后再做集成测试 |
| P1 | 在 `[id]/page.tsx` 查询加入 `user_id` 过滤（M5），消除数据泄露风险 |
| P1 | 修复 m3（非法 project id 永久 spinner），增加 404 降级 |
| P2 | 对齐 Server Actions Zod 校验（M2 残余项：`updateDeliverable`、`updateScopeRequest`、`createChangeOrder`） |
| P2 | 明确"时间线对比"的需求优先级——是当前阻塞还是 v0.2 路线图 |
| P3 | 统一 Supabase 包为 `@supabase/ssr`（M3） |
| P3 | 补充`env.local.example` 增加 `SUPABASE_SERVICE_ROLE_KEY` |

**总体判断**：项目 UI 层完成度高，三大 MVP 功能均可走通基本流程。但架构层面的 Server Actions 路线、Supabase 包统一、Zod 校验覆盖率等问题需在进入生产构建前解决。建议在当前阶段完成 P0-P1 修复后进入 Beta 内部验证。
