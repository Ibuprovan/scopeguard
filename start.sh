#!/usr/bin/env bash
# ScopeGuard 一键启动脚本（macOS / Linux）
# 使用方法：在终端中执行 ./start.sh

set -e

# 切到脚本所在目录
cd "$(dirname "$0")"

echo
echo "========================================"
echo "   ScopeGuard 一键启动"
echo "   范围蔓延守卫"
echo "========================================"
echo

# ============================================================
# 第 1 步：检查 Node.js 是否已安装
# ============================================================
if ! command -v node >/dev/null 2>&1; then
    echo "[错误] 未检测到 Node.js"
    echo
    echo "请先安装 Node.js："
    echo "  方式 1（推荐）：访问 https://nodejs.org，下载 LTS 版本安装"
    echo "  方式 2（macOS Homebrew）：brew install node"
    echo "  方式 3（Linux nvm）：nvm install --lts"
    echo
    echo "详细步骤请看 USER_MANUAL.md 的「第 1 步：安装 Node.js」"
    echo
    exit 1
fi

echo "[√] 已检测到 Node.js  $(node -v)"

# ============================================================
# 第 2 步：检查 .env.local 配置文件
# ============================================================
if [ ! -f ".env.local" ]; then
    echo
    echo "[!] 还没配置 Supabase，第一次运行需要先配置"
    echo "已经帮你从模板复制了一份 .env.local 文件"
    cp .env.local.example .env.local
    echo
    echo "----------------------------------------"
    cat .env.local
    echo "----------------------------------------"
    echo
    echo "接下来请："
    echo "  1. 用任意文本编辑器打开 .env.local"
    echo "  2. 把两个 your-... 替换成你 Supabase 项目的真实值"
    echo "  3. 保存"
    echo "  4. 重新执行 ./start.sh"
    echo
    echo "详细步骤请看 USER_MANUAL.md 的「第 3 步：注册并配置 Supabase」"
    echo
    exit 1
fi

if grep -qE "your-project|your-anon-key|placeholder|xxx" .env.local; then
    echo
    echo "[!] .env.local 里还是示例值，没有填入真实的 Supabase 信息"
    echo
    echo "请用文本编辑器打开 .env.local，把两个占位值替换成你 Supabase 项目的："
    echo "  - NEXT_PUBLIC_SUPABASE_URL       -> Project URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY  -> anon public key"
    echo
    echo "详细步骤请看 USER_MANUAL.md 的「第 3 步：注册并配置 Supabase」"
    echo
    exit 1
fi

echo "[√] 配置文件 .env.local 已就绪"

# ============================================================
# 第 3 步：安装依赖（仅首次运行）
# ============================================================
if [ ! -d "node_modules" ]; then
    echo
    echo "[*] 首次运行，正在安装依赖包..."
    echo "    可能需要 1-3 分钟，请耐心等待"
    echo
    npm install --no-audit --no-fund
    echo
    echo "[√] 依赖安装完成"
else
    echo "[√] 依赖包已安装（跳过安装步骤）"
fi

# ============================================================
# 第 4 步：启动开发服务器
# ============================================================
echo
echo "========================================"
echo "   正在启动..."
echo "   浏览器会在 5 秒后自动打开"
echo
echo "   如果没有自动打开，请手动访问："
echo "       http://localhost:3000"
echo
echo "   按 Ctrl + C 停止程序"
echo "========================================"
echo

# 5 秒后异步打开浏览器
(
    sleep 5
    if command -v open >/dev/null 2>&1; then
        open http://localhost:3000
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open http://localhost:3000
    fi
) &

# 启动 Next.js 开发服务器
npm run dev
