# ScopeGuard — 数据库物理建模文档

> 版本：v0.1｜状态：DRAFT｜更新：2026-06-29

---

## 1. PostgreSQL 枚举类型

```sql
CREATE TYPE project_status AS ENUM ('active', 'completed', 'archived');
CREATE TYPE deliverable_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE scope_request_status AS ENUM ('pending', 'included_in_quote', 'quoted');
CREATE TYPE change_order_status AS ENUM ('draft', 'sent', 'acknowledged', 'negotiated');
CREATE TYPE user_plan AS ENUM ('free', 'pro');
```

> 注：PostgreSQL ENUM 类型后续添加新值需执行 `ALTER TYPE ... ADD VALUE`，不支持删除。若预期枚举值会频繁变更，可改用 `text` + `CHECK` 约束。

---

## 2. 完整 DDL

### 2.1 profiles

与 `auth.users` 通过触发器自动同步（Supabase 标准模式）。

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  plan        user_plan NOT NULL DEFAULT 'free',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**自动创建 profile 的触发器：**

```sql
-- 用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 2.2 projects

```sql
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  name        TEXT NOT NULL,
  client_name TEXT,
  hourly_rate DECIMAL(10,2),
  status      project_status NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.3 deliverables

```sql
CREATE TABLE deliverables (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  status      deliverable_status NOT NULL DEFAULT 'pending',
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.4 scope_requests

```sql
CREATE TABLE scope_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  estimated_hours DECIMAL(6,2),
  is_out_of_scope BOOLEAN NOT NULL DEFAULT true,
  status          scope_request_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.5 change_orders

```sql
CREATE TABLE change_orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  items        JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL(12,2),
  status       change_order_status NOT NULL DEFAULT 'draft',
  share_token  TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.6 外键关系总览

```
profiles.id ──→ auth.users.id
projects.user_id ──→ auth.users.id
deliverables.project_id ──→ projects.id ON DELETE CASCADE
scope_requests.project_id ──→ projects.id ON DELETE CASCADE
change_orders.project_id ──→ projects.id ON DELETE CASCADE
```

---

## 3. 索引 DDL

```sql
-- projects: 按用户和状态查询
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_user_status ON projects(user_id, status);

-- deliverables: 按项目查询（看板加载交付物列表）
CREATE INDEX idx_deliverables_project_id ON deliverables(project_id);

-- scope_requests: 按项目查询 + 超范围筛选（偏差看板统计）
CREATE INDEX idx_scope_requests_project_id ON scope_requests(project_id);
CREATE INDEX idx_scope_requests_out_of_scope ON scope_requests(project_id, is_out_of_scope);

-- change_orders: 按项目查询 + 分享令牌查找
CREATE INDEX idx_change_orders_project_id ON change_orders(project_id);
CREATE INDEX idx_change_orders_share_token ON change_orders(share_token);
```

---

## 4. RLS 行级安全策略

### 4.1 profiles

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能查看/编辑自己的 profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- INSERT 由触发器 handle_new_user() 处理，无需用户直接 INSERT
```

### 4.2 projects

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 4.3 deliverables

```sql
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own deliverables"
  ON deliverables FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
```

### 4.4 scope_requests

```sql
ALTER TABLE scope_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own scope_requests"
  ON scope_requests FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
```

### 4.5 change_orders

```sql
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;

-- 用户管理自己的变更报价
CREATE POLICY "Users can manage own change_orders"
  ON change_orders FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- 匿名用户通过 share_token 读取报价单（公开分享）
CREATE POLICY "Anyone can view change_order by share_token"
  ON change_orders FOR SELECT
  USING (true);
```

> 注意：匿名 SELECT 策略需要配合应用层验证 `share_token` 有效性。由于 Supabase anon key 默认对所有表有 SELECT 权限，此策略实际对所有行开放读取。更严格的方案是移除 anon 的默认 SELECT 权限，改为写一个安全定义函数（SECURITY DEFINER function）按 `share_token` 查找并返回单行数据。

---

## 5. 免费项目限制

### 方案 A：应用层检查（推荐）

在 Server Action 创建项目前执行：

```typescript
// 伪代码 - 在 Server Action 中
const { count } = await supabase
  .from('projects')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('status', 'active');

if (count >= 2) {
  throw new Error('Free plan limit: max 2 active projects');
}
```

推荐理由：简单、易维护、不会因数据库触发器产生意外行为。

### 方案 B：数据库触发器（更严格）

```sql
CREATE OR REPLACE FUNCTION check_free_plan_project_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  current_plan  user_plan;
  active_count  INT;
BEGIN
  -- 获取用户套餐
  SELECT plan INTO current_plan FROM profiles WHERE id = NEW.user_id;

  IF current_plan = 'free' THEN
    SELECT COUNT(*) INTO active_count
    FROM projects
    WHERE user_id = NEW.user_id AND status = 'active';

    IF active_count >= 2 THEN
      RAISE EXCEPTION '免费版最多 2 个活跃项目，请升级到 Pro'
        USING HINT = 'Upgrade to pro at /pricing';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER before_insert_project_check_limit
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION check_free_plan_project_limit();
```

推荐理由：双重保障（应用层 + 数据库层），防止并发绕过。

---

## 6. 实体关系图（文字版）

```
┌─────────────────────────────────────────────────┐
│  auth.users (Supabase 内置)                      │
├─────────────────────────────────────────────────┤
│  id (PK)                                         │
│  email                                           │
│  encrypted_password                              │
│  ...                                             │
└──────────┬──────────────────────────────────────┘
           │ 1:1
┌──────────▼──────────────────────────────────────┐
│  profiles                                        │
├─────────────────────────────────────────────────┤
│  id (PK → auth.users.id)                        │
│  email                                          │
│  name                                           │
│  plan (free / pro)                              │
│  created_at                                     │
└──────────┬──────────────────────────────────────┘
           │ 1:N
┌──────────▼──────────────────────────────────────┐
│  projects                                        │
├─────────────────────────────────────────────────┤
│  id (PK)                 ◄── share_token 可公开 │
│  user_id (FK)            │   读取 change_order  │
│  name                    │                       │
│  client_name             │                       │
│  hourly_rate             │                       │
│  status (active/completed/archived)              │
│  created_at                                      │
└───┬──────────┬──────────┘                       │
    │          │                                    │
    │ 1:N      │ 1:N                                │
┌───▼─────┐  ┌─▼──────────┐  ┌───────────────────┐ │
│deliverables│ │scope_requests│ │ change_orders   │ │
├──────────┤  ├────────────┤  ├──────────────────┤ │
│ id (PK)  │  │ id (PK)    │  │ id (PK)          │ │
│project_id│  │project_id  │  │project_id        │─┘
│ name     │  │description │  │ items (jsonb)     │
│status    │  │est_hours   │  │ total_amount     │
│sort_order│  │out_of_scope│  │ status           │
│created_at│  │status      │  │ share_token (UQ) │
└──────────┘  │created_at  │  │ created_at       │
              └────────────┘  └──────────────────┘
```

---

## 7. 种子数据

MVP 阶段不建议预置种子。开发环境测试可通过 Supabase SQL Editor 或 `supabase/seed.sql` 脚本准备：

```sql
-- supabase/seed.sql (开发环境测试用)
-- 注意：需先通过 Supabase Auth 创建测试用户获取真实 UUID

-- 插入测试 profile
INSERT INTO profiles (id, email, name, plan) VALUES
  ('00000000-0000-0000-0000-000000000001', 'test@scopeguard.dev', '张三', 'free'),
  ('00000000-0000-0000-0000-000000000002', 'pro@scopeguard.dev', '李四', 'pro');

-- 插入测试项目
INSERT INTO projects (id, user_id, name, client_name, hourly_rate, status) VALUES
  ('p0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '官网改版', '某科技公司', 150.00, 'active'),
  ('p0000002-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '品牌 VI 设计', '某餐饮品牌', 200.00, 'active');

-- 插入测试交付物
INSERT INTO deliverables (project_id, name, description, status, sort_order) VALUES
  ('p0000001-0000-0000-0000-000000000001', '首页设计', '响应式首页 UI 设计', 'completed', 1),
  ('p0000001-0000-0000-0000-000000000001', '内页模板', '3 套内页模板', 'in_progress', 2),
  ('p0000001-0000-0000-0000-000000000001', '后台管理面板', '3 个核心管理页面', 'pending', 3);

-- 插入测试超范围需求
INSERT INTO scope_requests (project_id, description, estimated_hours, is_out_of_scope) VALUES
  ('p0000001-0000-0000-0000-000000000001', '增加多语言切换功能', 16.00, true),
  ('p0000001-0000-0000-0000-000000000001', '首页需要加一个新闻轮播区块', 4.00, true),
  ('p0000001-0000-0000-0000-000000000001', 'logo 颜色微调', 1.00, false);
```

---

## 8. 部署与迁移

| 阶段 | 操作 |
|------|------|
| 开发 | Supabase 本地 CLI + `supabase migration` |
| 预览 | 关联 Supabase 分支数据库 |
| 生产 | Supabase SQL Editor 手动执行，或 CI 自动运行迁移 |

MVP 阶段建议手动在 Supabase SQL Editor 执行本文件中的 DDL，按以下顺序：

1. 创建 ENUM 类型
2. 创建 profiles 表 + 触发器
3. 创建 projects → deliverables → scope_requests → change_orders
4. 创建索引
5. 启用 RLS 并应用策略
6. 创建免费项目限制触发器（可选）
