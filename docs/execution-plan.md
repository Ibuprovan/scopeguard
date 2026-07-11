# ScopeGuard 从 0 到有执行计划

> 价格：$4/mo 全球 · ¥19/mo 国内  
> 目标：4 周内跑通"用户看到 → 付费 → 用上"完整链路  
> 核心指标：**10 个付费用户**（不是 1000 个免费用户）

---

## 定价模型（已定）

| 档位 | 全球价格 | 国内价格 | 权益 |
|------|---------|---------|------|
| Free | $0 | ¥0 | 2 个活跃项目 + 基础追踪 |
| Pro Monthly | **$4/mo** | **¥19/mo** | 无限项目 + 变更报价单 + AI 分类 |
| Pro Yearly | **$40/yr**（省 17%） | **¥159/yr**（省 30%） | 同上，年付优惠 |

Pro 价格锚定在 $4（约一杯咖啡），让自由职业者觉得"这点钱都不值的话就不必了"。

---

## Week 1：上线地基（7 天）

### Day 1 — 域名 + 支付

**① 注册域名**
- 推荐：`scopeguard.app` 或 `scopeguard.fun` 或 `scopeguard.cn`
- 平台：Cloudflare（成本价无加价）或 Namecheap
- 预计：$10-15/年

**② 注册 Lemon Squeezy**
- 访问 `lemonsqueezy.com`，用护照注册
- 填写店铺信息（个人即可，不需要公司）
- 创建产品：
  - 产品名：ScopeGuard Pro
  - 定价：$4/month（月付），$40/year（年付）
  - 变体：Monthly / Yearly
- 拿到 Product ID + API Key + Webhook Secret

**③ 配置 Payoneer**
- 注册 payoneer.com（免费）
- 验证身份（3-5 个工作日）
- 绑定 Lemon Squeezy 提现账户

### Day 2 — 部署到生产

**① 项目准备**
```bash
# 克隆当前代码
# 配置环境变量
cp .env.local.example .env.local
# 填入 NEXT_PUBLIC_SUPABASE_URL
# 填入 NEXT_PUBLIC_SUPABASE_ANON_KEY
# 填入 LEMONSQUEEZY_API_KEY
# 填入 LEMONSQUEEZY_STORE_ID
# 填入 LEMONSQUEEZY_WEBHOOK_SECRET
```

**② Vercel 部署**
- 在 vercel.com 导入 GitHub 仓库
- 填入环境变量
- 等待自动部署完成（~3 分钟）
- 绑定自定义域名（在 Vercel 项目设置中添加）

**③ 测试全链路**
- 访问域名 → 看到首页
- 邮箱注册 → 收到 Magic Link
- 登录 → 创建项目 → 录入交付物 → 标记需求 → 看到看板

### Day 3 — 法律页面 + Cookie 合规

**生成页面：**
- `/privacy` — 隐私政策（termsfeed.com 生成）
- `/tos` — 服务条款
- `/refund` — 退款政策

**需要包含的内容：**
- 收集什么数据（邮箱、项目数据）
- 数据存储在哪里（Supabase，美国西岸）
- 是否共享给第三方（不共享）
- Cookie 使用（Supabase Auth 用 cookie）
- 退款政策（14 天无条件退款）

### Day 4 — 支付集成

**① 在网站上添加"升级"入口**

修改以下位置接入 Lemon Squeezy Checkout：
- 仪表盘的"升级到 Pro"按钮
- 项目详情页的 Pro 提示区域
- 变更报价单预览页

**② 添加 Webhook 端点**

```typescript
// app/api/lemonsqueezy/webhook/route.ts
// 监听 subscription_created, subscription_updated, subscription_cancelled
// 更新用户 plan 字段：free → pro
```

### Day 5 — Landing Page 优化

修改首页 `app/page.tsx`：
- 第一个屏幕就要说明"解决什么问题"
- 加上实际的数字证据（57% 自由职业者损失 $1,000+）
- 价格放出来（$4/mo，不隐藏）
- 加上 CTA（开始免费使用 / 立即升级）

### Day 6 — SEO + 分析

**① SEO 基础**
- `<head>` 加上 meta description、Open Graph 标签
- 生成一个 sitemap.xml
- robots.txt

**② 接入分析**
- 注册 Plausible（`plausible.io`，免费 30 天）或 Umami（开源）
- 在 `app/layout.tsx` 中添加统计脚本

### Day 7 — 全链路测试 + Bug 修复

完整走一遍用户路径，修复所有明显问题：
1. 访问首页 → 注册 → 登录
2. 创建项目 → 录入交付物
3. 标记超范围需求
4. 看偏差看板
5. 升级到 Pro（走通付款流程）
6. 生成变更报价单

---

## Week 2：冷启动推广（7 天）

### 全球渠道

| 日期 | 渠道 | 内容 | 目标 |
|------|------|------|------|
| Day 8 | Reddit r/freelance | "I built a free tool to track scope creep. No signup wall." | 200-500 UV |
| Day 9 | Reddit r/SideProject | Show & Tell：3 个 MVP 功能的 GIF | 100-300 UV |
| Day 10 | Indie Hackers | 写"我是一个中国独立开发者，做了一个对付'顺便加需求'的工具" | 故事帖，建立声誉 |
| Day 11 | Hacker News | Show HN：ScopeGuard | 看运气，不要指望 |
| Day 12 | Twitter/X | 发一条带截图的推 #buildinpublic #freelancetips | 积累关注者 |

### 内容策略

**一条帖子的标准结构：**
```
标题：问题 → 解决方案 → 链接

（正文不要多于 5 句话）
"过去 3 个月，我帮一个设计师朋友统计了一下：
合同约定 4 项交付物，最终交付了 11 项，白干了 70 个小时。
所以我做了一个小工具，让你每次花 10 秒记录客户的新需求，
最后能自动算出来：白干了多少，值多少钱。
免费。链接：xxx"
```

### 国内渠道

| 渠道 | 策略 |
|------|------|
| 即刻 | "我做了一个防白嫖工具，专治客户'顺便加需求'" |
| V2EX | "分享创造"节点发帖，写技术实现（Next.js + Supabase） |
| 小红书 | 图文形式：晒"合同 4 项 vs 实际 11 项"的对比图 |

**国内渠道重点打情感牌：** "做设计的你，有没有遇到过客户说'顺便'？"

---

## Week 3：观察 + 迭代（7 天）

### 看数据

| 指标 | 目标 | 如果没达到 |
|------|------|-----------|
| 网站访问量 | 500+/周 | 换渠道或改标题 |
| 注册转化率 | >5% | 优化 Landing Page |
| 免费→付费转化率 | >3% | 降低价格或增加 Pro 价值 |
| 日活跃用户 | >5 | 产品有问题 |

### 用户反馈循环

- 给每个注册用户发一封邮件（Resend 免费版）
- 问：你最大的痛点是什么？
- 按反馈修优先级最高的 bug 或加最简单的新功能

---

## Week 4：扩渠道（7 天）

**如果有了 3-5 个付费用户：**
- Product Hunt 发布（提前准备 demo 视频）
- AppSumo 尝试 LTD（$29 终身买断，加速现金流）
- 在 GitHub 开源核心代码（前端 + 基础逻辑，保留 Pro）
  - 中文 README
  - 写好部署文档（Docker 一键部署）
  - V2EX / 即刻发"开源了"

**如果还没付费用户：**
- 重新审视产品定位
- 跟 5 个目标用户直接聊天
- 改产品方向或功能

---

## 上线前准备清单

### 技术

- [ ] 域名已注册并绑定 Vercel
- [ ] Vercel 部署成功，HTTPS 正常
- [ ] Supabase 项目创建，环境变量配置
- [ ] Lemon Squeezy 产品创建，Webhook 端点就绪
- [ ] 支付流程全链路测试通过
- [ ] 隐私政策 / 服务条款 / 退款政策页面在线
- [ ] SEO 基础（<head> meta, sitemap, robots.txt）
- [ ] 分析工具接入

### 内容

- [ ] Landing Page 文案定稿（中文 + 英文准备）
- [ ] 3 张产品截图（首页 / 看板 / 报价单）
- [ ] 1 个 demo 视频（<2分钟，可选）
- [ ] Reddit 帖子草稿
- [ ] Indie Hackers 故事帖草稿

### 法律

- [ ] 隐私政策
- [ ] 服务条款
- [ ] 退款政策

---

## 关键资源汇总

| 资源 | 成本 | 链接 |
|------|------|------|
| 域名 | $10-15/年 | cloudflare.com / namecheap.com |
| Vercel | 免费 | vercel.com |
| Supabase | 免费层 | supabase.com |
| Lemon Squeezy | 免费（抽成 5%+$0.50） | lemonsqueezy.com |
| Payoneer | 免费 | payoneer.com |
| Resend | 免费 100封/天 | resend.com |
| Plausible | 免费 30天 | plausible.io |
| GitHub | 免费 | github.com |

**总启动成本：$10-15（仅域名费用）**

---

> 文档版本：v1.0 · 2026-06-29  
> 核心理念：先验证有人付钱，再考虑规模化。10 个付费用户 > 1000 个免费用户。
