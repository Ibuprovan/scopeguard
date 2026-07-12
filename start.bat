@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title ScopeGuard 一键启动

echo.
echo ========================================
echo    ScopeGuard 一键启动
echo    范围蔓延守卫
echo ========================================
echo.

REM ============================================================
REM 第 1 步：检查 Node.js 是否已安装
REM ============================================================
where node >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 Node.js
    echo.
    echo 请先安装 Node.js：
    echo   1. 打开浏览器，访问 https://nodejs.org
    echo   2. 点击页面上绿色的 "LTS" 下载按钮（左边那个）
    echo   3. 双击下载的安装包，一路点 "Next" 到底
    echo   4. 安装完成后，关闭这个黑窗口
    echo   5. 重新双击 start.bat
    echo.
    echo 详细图文步骤请看 USER_MANUAL.md 的"第 1 步：安装 Node.js"
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo [√] 已检测到 Node.js  !NODE_VERSION!

REM ============================================================
REM 第 2 步：检查 .env.local 配置文件
REM ============================================================
if not exist ".env.local" (
    echo.
    echo [!] 还没配置 Supabase，第一次运行需要先配置
    echo.
    echo 已经帮你从模板复制了一份 .env.local 文件
    copy .env.local.example .env.local >nul
    echo.
    echo ----------------------------------------
    type .env.local
    echo ----------------------------------------
    echo.
    echo 接下来请：
    echo   1. 用记事本打开 .env.local 文件
    echo   2. 把两个 your-... 替换成你 Supabase 项目的真实值
    echo   3. 保存关闭
    echo   4. 重新双击 start.bat
    echo.
    echo 详细步骤请看 USER_MANUAL.md 的"第 3 步：注册并配置 Supabase"
    echo.
    pause
    exit /b 1
)

REM 检查是否还是占位值
findstr /C:"your-project" /C:"your-anon-key" /C:"placeholder" /C:"xxx" .env.local >nul
if not errorlevel 1 (
    echo.
    echo [!] .env.local 里还是示例值，没有填入真实的 Supabase 信息
    echo.
    echo 请用记事本打开 .env.local，把两个占位值替换成你 Supabase 项目的：
    echo   - NEXT_PUBLIC_SUPABASE_URL       -^> Project URL
    echo   - NEXT_PUBLIC_SUPABASE_ANON_KEY  -^> anon public key
    echo.
    echo 详细步骤请看 USER_MANUAL.md 的"第 3 步：注册并配置 Supabase"
    echo.
    pause
    exit /b 1
)

echo [√] 配置文件 .env.local 已就绪

REM ============================================================
REM 第 3 步：安装依赖（仅首次运行）
REM ============================================================
if not exist "node_modules" (
    echo.
    echo [*] 首次运行，正在安装依赖包...
    echo     可能需要 1-3 分钟，请耐心等待，不要关闭窗口
    echo.
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        echo.
        echo [错误] 依赖安装失败
        echo.
        echo 可能原因：
        echo   1. 网络不稳定，请稍后重试
        echo   2. 试试切换 npm 镜像：npm config set registry https://registry.npmmirror.com
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [√] 依赖安装完成
) else (
    echo [√] 依赖包已安装（跳过安装步骤）
)

REM ============================================================
REM 第 4 步：启动开发服务器
REM ============================================================
echo.
echo ========================================
echo    正在启动...
echo    浏览器会在 5 秒后自动打开
echo.
echo    如果没有自动打开，请手动访问：
echo        http://localhost:3000
echo.
echo    关闭这个黑窗口即可停止程序
echo ========================================
echo.

REM 5 秒后异步打开浏览器
start "" /b cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

REM 启动 Next.js 开发服务器
call npm run dev

echo.
echo ========================================
echo    程序已停止
echo    下次使用直接双击 start.bat 即可
echo ========================================
echo.
pause
