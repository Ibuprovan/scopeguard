# ScopeGuard 产品决策文档：从付费产品到开源项目

> 版本：v1.0｜日期：2026-06-29｜决策人：项目负责人

---

## 1. 摘要

本文档记录了 ScopeGuard 项目从"部署上线做付费 SaaS 产品"到"开源至 GitHub 作为技术作品"的决策过程。该决策基于市场调研、竞品分析、痛点验证和财务模型推演，核心结论是：**该痛点真实但不够致命，目标用户付费意愿极低，作为独立开发者的付费产品不具备商业可行性，作为技术作品开源是更优选择。**

---

## 2. 市场调研

### 2.1 目标市场规模

| 指标 | 数据 | 来源 |
|------|------|------|
| 中国灵活就业人口 | 约 3.2 亿 | 公开统计，2025-2026 |
| 知识型自由职业者占比 | 约 35%（设计师、程序员、文案、咨询师等） | 行业报告 |
| 知识型自由职业者估计人数 | 约 1.12 亿（广义） | 推算 |
| 会使用工具管理项目流程的 | < 5% | 行业经验估算 |

**关键结论**：市场基数看似庞大，但真正会主动寻找并使用项目管理工具的自由职业者是极少数。多数人依赖微信备忘、Excel、纸质笔记等零成本方式。

### 2.2 痛点验证

范围蔓延（Scope Creep）是自由职业者面临的真实问题，行业调研数据如下：

| 痛点指标 | 数据 |
|----------|------|
| 经历过范围蔓延的自由职业者 | 约 57%-72% |
| 因范围蔓延每月损失金额 | $75-$1,000+ |
| 痛点性质 | "钝痛"——持续发生但单次影响不大 |

**核心问题**：痛点真实存在，但属于"可忍受的钝痛"。用户更倾向于用现有零成本手段（口头沟通、合同附件、微信记录）应对，而非引入新工具并承担学习成本和迁移成本。

### 2.3 竞品与替代方案

| 替代方案 | 成本 | 覆盖度 | 切换成本 |
|----------|------|--------|----------|
| 纸质笔记/脑记 | ¥0 | 部分覆盖 | 无 |
| Excel/Google Sheets | ¥0 | 大部分覆盖 | 低 |
| Notion/飞书文档 | ¥0-50/月 | 完全覆盖 | 中 |
| 合同附件+邮件 | ¥0 | 部分覆盖 | 无 |
| 专业项目管理工具（Asana/Trello） | $0-10/月 | 完全覆盖 | 高 |

ScopeGuard 的差异化定位是"专注范围蔓延追踪 + 自动生成变更报价单"。但这个差异化不够强——多数自由职业者用 Excel 列一个交付物清单就能达到类似效果。

---

## 3. 原付费产品设计方案

> 本章节记录了在决定开源之前，ScopeGuard 作为付费 SaaS 产品的完整设计思路。这些设计已在代码中实现并经过验证，后因商业可行性不足（见第 4 章决策分析）而移除付费相关代码，改为全功能开源。保留此章节作为设计思考的记录。

### 3.1 变现模式：Freemium

采用 **Freemium（免费增值）** 模式，核心逻辑是：让用户先用免费版亲手看到"原来超范围这么多"，到真需要发报价单时产生付费动机。

| 层级 | 价格 | 功能 |
|------|------|------|
| Free | ¥0 | 2 个活跃项目 + 范围设定 + 偏差看板 + 报价单预览（不可发送） |
| Pro | $4/月（全球）· ¥19/月（国内）· $40/年 | 无限项目 + 报价单生成/分享 + AI 分类 |

定价依据：
- **$4/月**：低于一杯咖啡的价格，降低决策门槛
- **¥19/月**：国内定价，参考同类工具（Notion $8、飞书 ¥60）的心理价位区间
- **$40/年**：年付优惠约 17%，提升 LTV

### 3.2 Pro 功能门控设计

门控原则：**免费版能看到价值，但无法完成最后一步**。

| 功能 | Free | Pro |
|------|------|-----|
| 范围边界设定器 | ✅ | ✅ |
| 超范围标记 + 偏差看板 | ✅ | ✅ |
| 需求时间线 | ✅ | ✅ |
| 变更报价单预览 | ✅（只读） | ✅ |
| 生成正式报价单 | ❌ | ✅ |
| 分享链接发送客户 | ❌ | ✅ |
| 无限活跃项目 | ❌（上限 2 个） | ✅ |

### 3.3 服务端校验架构

Pro 校验在 **Server Actions 层** 实现，不依赖客户端隐藏 UI。即使前端被绕过，服务端也会拒绝操作。

```typescript
// 原设计：createChangeOrder Server Action
export async function createChangeOrder(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Pro 校验：查询 profiles.plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'pro') {
    throw new Error('变更报价单是 Pro 功能，请升级到 Pro')
  }

  // ... 继续生成报价单
}
```

同样校验应用于 `sendChangeOrder`（发送分享链接）。免费项目数限制在 `createProject` 中检查：

```typescript
// 原设计：免费版项目数限制
if (profile?.plan === 'free') {
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (count !== null && count >= 2) {
    throw new Error('免费版最多 2 个活跃项目，请升级到 Pro')
  }
}
```

### 3.4 支付集成方案：Lemon Squeezy

选择 Lemon Squeezy 而非 Stripe 的原因：
- **MoR（Merchant of Record）**：Lemon Squeezy 作为记录商家处理全球税务（VAT/GST），独立开发者无需自己处理各国税务合规
- **支持国内开发者**：Stripe 不支持中国大陆主体，Lemon Squeezy 支持
- **无月费**：按交易抽成 5% + ¥1.5，零收入时零成本

#### 支付流程

```
用户点击"升级到 Pro"
  → 前端调用 getProCheckoutUrl(email) 生成 Lemon Squeezy Checkout URL
  → 浏览器跳转到 Lemon Squeezy 托管的支付页面
  → 用户完成支付
  → Lemon Squeezy 发送 webhook 到 /api/lemonsqueezy/webhook
  → Webhook 验证签名后，更新 profiles.plan = 'pro'
  → 用户下次刷新页面即为 Pro 用户
```

#### Webhook 签名验证

```typescript
// 原设计：webhook 签名验证
function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}
```

Webhook 处理的事件：
- `subscription_created` / `subscription_updated` → `plan = 'pro'`
- `subscription_cancelled` / `subscription_expired` → `plan = 'free'`

#### 环境变量

```env
NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=store_xxx
NEXT_PUBLIC_LS_PRO_MONTHLY_VARIANT_ID=variant_xxx
NEXT_PUBLIC_LS_PRO_YEARLY_VARIANT_ID=variant_xxx
LEMONSQUEEZY_API_KEY=org_xxx
LEMONSQUEEZY_WEBHOOK_SECRET=whk_xxx
```

### 3.5 数据库层设计

#### plan 字段

```sql
CREATE TYPE user_plan AS ENUM ('free', 'pro');

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  plan        user_plan NOT NULL DEFAULT 'free',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

新用户注册时通过触发器自动创建 profile，默认 `plan = 'free'`。支付成功后由 webhook 更新为 `'pro'`。

#### 免费项目数限制（双重保障）

- **方案 A（应用层）**：Server Action 中 `count` 查询，≥ 2 时拒绝创建（已实现）
- **方案 B（数据库层）**：BEFORE INSERT 触发器检查 `plan = 'free'` 且活跃项目 ≥ 2 时抛异常（更严格，防并发绕过）

### 3.6 部署方案

| 项目 | 内容 |
|------|------|
| 平台 | Vercel（零配置部署 Next.js） |
| 数据库 | Supabase Free Tier（500MB PostgreSQL + 50,000 月活） |
| 支付 | Lemon Squeezy（MoR，无月费） |
| 域名 | `scopeguard.app`（.com，¥55-70/年） |
| 环境变量 | 7 个（2 个 Supabase + 5 个 Lemon Squeezy） |
| SEO | sitemap.ts + robots.txt + OpenGraph 元数据 |
| 法律页面 | 隐私政策 + 服务条款 + 退款政策 |

#### 部署清单

1. Supabase 创建项目，执行 DDL + RLS 策略
2. Lemon Squeezy 创建 Store + 两个 Variant（月付/年付）
3. 配置 Webhook URL 指向 Vercel 部署地址
4. Vercel 导入 GitHub 仓库，配置环境变量
5. 绑定自定义域名，配置 DNS
6. 上线法律页面，确保合规

---

## 4. 财务模型推演

### 4.1 成本结构

| 项目 | 月成本 | 备注 |
|------|--------|------|
| Vercel Hobby | ¥0 | 100GB 带宽，足够早期使用 |
| Supabase Free | ¥0 | 500MB 数据库，50,000 月活 |
| Lemon Squeezy | ¥0 | 按交易抽成 5%+¥1.5，无月费 |
| 域名（.com） | ¥5/月（摊算 ¥55-70/年） | 自定义域名 |
| **合计** | **¥5/月** | |

### 4.2 收入预期

基于 Freemium 行业基准转化率（2%-5%）和保守获客预估：

| 指标 | 乐观场景 | 现实场景 | 悲观场景 |
|------|----------|----------|----------|
| 月注册用户 | 500 | 100 | 30 |
| 付费转化率 | 5% | 2% | 1% |
| 付费用户数 | 25 | 2-5 | 0-1 |
| 月收入（¥19/月） | ¥475-950 | ¥38-95 | ¥0-19 |
| 月净利润 | ¥470-945 | ¥33-90 | -¥5 至 ¥14 |

**关键结论**：在现实场景下，月收入约 ¥38-95，仅能覆盖域名成本。考虑到获取前 100 个注册用户需要大量手动推广（社群发帖、私信触达），时间投入产出比极低。

### 4.3 盈亏平衡分析

要实现月收入 ¥500（约等于一顿像样的饭钱），需要：
- 26 个付费用户（¥19/月）
- 按 3% 转化率计算，需要约 870 个注册用户
- 获取 870 个注册用户，按 10% 注册转化率计算，需要约 8,700 次有效访问
- 作为无预算、无渠道的独立开发者，获取 8,700 次有效访问至少需要 3-6 个月的持续内容营销

---

## 5. 决策分析

### 5.1 不做付费产品的原因

| 维度 | 分析 |
|------|------|
| 痛点致命性 | 不致命。用户可用 Excel/纸笔替代，切换动力不足 |
| 付费意愿 | 极低。目标用户（自由职业者）对工具付费敏感 |
| 差异化壁垒 | 弱。核心功能（交付物清单+变更报价）易被 Excel 复刻 |
| 获客渠道 | 无。无现有流量池，SEO 需长期投入，广告 ROI 为负 |
| 时间机会成本 | 高。2-3 周部署+推广时间，等价于 100+ 道 LeetCode |

### 5.2 选择开源的原因

| 维度 | 分析 |
|------|------|
| 简历价值 | "开源全栈项目"是技术能力的可验证证明 |
| 面试可聊深度 | Server Actions 架构、RLS 安全设计、Pro 校验方案均可深聊 |
| 维护成本 | 低。无需服务器运维、无需用户支持 |
| 时间效率 | 1-2 天完成 README 和文档，投入产出比高 |

### 5.3 被否决的折中方案

**"免费上线但不接支付"**：部署到 Vercel 免费子域名，全功能免费开放。

- 优点：简历可写"已上线产品"
- 缺点：需额外 2-3 天处理数据库 schema、部署调试、防暂停等运维问题；且"免费产品无用户"在面试中比"开源项目"更尴尬
- 结论：投入产出比不如直接开源

---

## 6. 最终决策

**将 ScopeGuard 作为技术作品开源至 GitHub，不做付费产品部署。**

### 6.1 项目定位

ScopeGuard 定位为**全栈技术作品**，展示以下能力：

- Next.js 14 App Router + Server Actions 架构设计
- Supabase 认证 + RLS 行级安全 + 数据库设计
- 完整的产品文档体系（PRD、架构文档、代码审查报告、本决策文档）
- 产品决策能力：从市场调研到财务推演到最终决策的完整思考链路

### 6.2 决策启示

本次决策过程的核心教训：

1. **痛点真实 ≠ 付费意愿**。能忍的痛点，用户不会花钱解决。
2. **技术完成度 ≠ 商业可行性**。代码写得再好，没有用户就没有价值。
3. **独立开发者的最大成本是时间**，不是金钱。每个决策都要考虑时间机会成本。

---

## 参考资料

- [中国灵活就业人口统计](https://m.toutiao.com/group/7659186432195543615/) - 灵活就业 3.2 亿，知识型占比 35%
- [Freemium 模式转化率基准](https://m.baike.com/wiki/Freemium/6094557) - 二八定律，2%-5% 转化率
- [SaaS 免费试用 vs 免费增值](https://m.toutiao.com/group/7587670951039369766/) - Freemium 模式适用场景分析
