# ScopeGuard — 范围蔓延守卫

> 让每一次"再加一个需求"都可量化、可管理。

自由职业者的范围蔓延追踪工具。在项目开始时建立合同交付物基线，客户每次新增需求时一键标记"超范围"或"合同内"，实时查看偏差看板，一键生成变更报价单。

---

## 完全不懂技术？从这里开始

如果你不会编程，但想用这个工具，**直接看小白专用手册**：

> [USER_MANUAL.md](USER_MANUAL.md) — 面向零基础用户的图文操作指南

最简流程：

1. 装 Node.js（5 分钟，一次性）
2. 下载本项目（1 分钟）
3. 注册 Supabase 并配置（15 分钟，一次性）
4. **双击 `start.bat`**（Windows）或在 Mac 终端运行 `./start.sh`（10 秒，每次用都做）
5. 浏览器自动打开，开始使用

所有细节都在 [USER_MANUAL.md](USER_MANUAL.md) 里，跟着做就行。

---

## 核心功能

- **范围边界设定器** — 录入合同交付物清单，3 分钟建立范围基线
- **超范围标记 + 偏差看板** — 一键标记需求类型，实时显示合同进度 / 超范围数 / 额外工时 / 时薪损失
- **一键变更报价单** — 自动汇总所有超范围需求，生成可分享的报价单链接

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | Next.js 14 (App Router + Server Actions) |
| 数据库 | Supabase (PostgreSQL + RLS 行级安全) |
| 认证 | Supabase Auth (Magic Link 无密码登录) |
| 验证 | Zod schema 验证 (Server Actions 层) |
| 样式 | Tailwind CSS (深色主题) |
| 语言 | TypeScript (全栈类型安全) |

## 快速开始

### 方式 A：一键启动脚本（推荐）

仓库内置了启动脚本，会自动检查环境、安装依赖、启动并打开浏览器：

- **Windows**：双击 `start.bat`
- **macOS / Linux**：终端执行 `./start.sh`

首次运行会引导你配置 `.env.local`（参考下方或 [USER_MANUAL.md](USER_MANUAL.md)）。

### 方式 B：手动命令行（开发者）

```bash
# 1. 克隆仓库
git clone https://github.com/Ibuprovan/scopeguard.git
cd scopeguard

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.local.example .env.local  # 或手动创建
# 填入你的 Supabase URL 和 anon key
```

创建 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

```bash
# 4. 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可。

## 数据库配置

在 Supabase 项目的 SQL Editor 中执行 [`supabase/init.sql`](supabase/init.sql)（一次性，全选复制粘贴执行即可），创建以下表结构：

- `profiles` — 用户资料（注册时自动创建）
- `projects` — 项目（含客户名、时薪、状态）
- `deliverables` — 合同交付物清单
- `scope_requests` — 需求记录（超范围 / 合同内）
- `change_orders` — 变更报价单

所有表均配置 RLS 策略，用户只能访问自己的数据。详细步骤见 [USER_MANUAL.md](USER_MANUAL.md) 第 3.5 节。

## 项目结构

```
scopeguard/
├── app/
│   ├── (auth)/              — 登录 + Auth callback
│   ├── api/                 — 公开分享链接 API
│   ├── dashboard/           — 项目仪表盘
│   ├── projects/[id]/       — 项目详情 + 偏差看板 + 变更报价单
│   └── page.tsx             — 落地页
├── components/              — React 组件 (UI kit + 业务组件)
├── lib/
│   ├── actions/             — Server Actions (CRUD + Zod 验证)
│   ├── supabase/            — Supabase 客户端 (server + browser + middleware)
│   └── utils/               — 格式化 + Zod validators
├── types/                   — TypeScript 类型定义
└── docs/                    — 文档 (架构 / 数据库 / PRD / 决策记录)
```

## 架构亮点

- **Server Actions + Zod** — 所有数据写入经服务端验证，不暴露数据库直接操作
- **RLS 双重校验** — 数据库行级安全 + Server Action 层 user_id 过滤
- **零 Server Components** — 全 Client Component 架构，数据通过 Server Actions 加载
- **Magic Link 认证** — 无密码，邮箱链接登录

## 文档

| 文档 | 说明 |
|------|------|
| [USER_MANUAL.md](USER_MANUAL.md) | 用户手册（小白专用，零基础也能跑起来） |
| [docs/architecture.md](docs/architecture.md) | 架构设计文档 |
| [docs/database.md](docs/database.md) | 数据库 DDL + RLS 策略（开发者参考） |
| [supabase/init.sql](supabase/init.sql) | 数据库初始化 SQL（部署时一次执行） |
| [docs/prd.md](docs/prd.md) | 产品需求文档 |
| [docs/review-report.md](docs/review-report.md) | 代码审查报告 |
| [docs/product-decision.md](docs/product-decision.md) | 产品决策记录：从付费 SaaS 到开源项目的分析过程 |

## License

MIT
