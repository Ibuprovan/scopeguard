-- ============================================================
-- ScopeGuard 数据库初始化脚本
-- ------------------------------------------------------------
-- 适用：Supabase 项目首次部署
-- 用法：
--   1. 打开 Supabase 项目控制台
--   2. 左侧菜单点 "SQL Editor"
--   3. 点 "+ New Query"
--   4. 把这个文件的全部内容粘贴进去
--   5. 点 "Run" 按钮
--   6. 看到底部 "Success" 即表示成功
-- ============================================================

-- ============================================================
-- 1. 创建枚举类型
-- ============================================================
CREATE TYPE project_status AS ENUM ('active', 'completed', 'archived');
CREATE TYPE deliverable_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE scope_request_status AS ENUM ('pending', 'included_in_quote', 'quoted');
CREATE TYPE change_order_status AS ENUM ('draft', 'sent', 'acknowledged', 'negotiated');

-- ============================================================
-- 2. 创建 profiles 表（用户档案，注册时自动创建）
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 新用户注册时自动创建 profile 的触发器
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

-- ============================================================
-- 3. 创建 projects 表（项目）
-- ============================================================
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  name        TEXT NOT NULL,
  client_name TEXT,
  hourly_rate DECIMAL(10,2),
  status      project_status NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. 创建 deliverables 表（合同交付物清单）
-- ============================================================
CREATE TABLE deliverables (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  status      deliverable_status NOT NULL DEFAULT 'pending',
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. 创建 scope_requests 表（需求记录：超范围 / 合同内）
-- ============================================================
CREATE TABLE scope_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  estimated_hours DECIMAL(6,2),
  is_out_of_scope BOOLEAN NOT NULL DEFAULT true,
  status          scope_request_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. 创建 change_orders 表（变更报价单）
-- ============================================================
CREATE TABLE change_orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  items        JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL(12,2),
  status       change_order_status NOT NULL DEFAULT 'draft',
  share_token  TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. 创建索引（提升查询性能）
-- ============================================================
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_user_status ON projects(user_id, status);

CREATE INDEX idx_deliverables_project_id ON deliverables(project_id);

CREATE INDEX idx_scope_requests_project_id ON scope_requests(project_id);
CREATE INDEX idx_scope_requests_out_of_scope ON scope_requests(project_id, is_out_of_scope);

CREATE INDEX idx_change_orders_project_id ON change_orders(project_id);
CREATE INDEX idx_change_orders_share_token ON change_orders(share_token);

-- ============================================================
-- 8. 启用 RLS（行级安全）—— 确保用户只能访问自己的数据
-- ============================================================

-- 8.1 profiles：用户只能查看/编辑自己的档案
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 8.2 projects：用户只能管理自己的项目
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8.3 deliverables：通过所属项目过滤
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

-- 8.4 scope_requests：通过所属项目过滤
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

-- 8.5 change_orders：用户管理自己的报价单 + 任何人可通过 share_token 读取
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Anyone can view change_order by share_token"
  ON change_orders FOR SELECT
  USING (true);

-- ============================================================
-- 全部完成
-- 你现在可以关闭 SQL Editor，回到 USER_MANUAL.md 继续下一步
-- ============================================================
