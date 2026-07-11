import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="max-w-lg mx-auto px-5 py-12">
      <Link href="/" className="text-sm text-brand hover:underline mb-6 inline-block">&larr; 返回首页</Link>
      <h1 className="text-2xl font-bold text-text-primary mb-6">隐私政策</h1>

      <div className="text-sm text-text-secondary leading-relaxed space-y-4">
        <p>最后更新：2026 年 6 月 29 日</p>

        <h2 className="text-base font-semibold text-text-primary mt-6">1. 我们收集什么数据</h2>
        <p>ScopeGuard（以下简称"本产品"）在您注册和使用过程中收集以下数据：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>邮箱地址（用于登录认证和发送通知）</li>
          <li>项目信息（项目名称、客户名称、交付物列表、需求标记记录）</li>
          <li>使用数据（页面访问、功能使用情况，仅用于改进产品）</li>
        </ul>

        <h2 className="text-base font-semibold text-text-primary mt-6">2. 数据存储</h2>
        <p>所有数据存储在 Supabase（美国西岸服务器）。我们采取行业标准的安全措施保护您的数据。</p>

        <h2 className="text-base font-semibold text-text-primary mt-6">3. 数据共享</h2>
        <p>我们不会将您的个人数据出售或共享给任何第三方。以下情况除外：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>法律要求</li>
          <li>您主动共享的变更报价单链接（仅包含您选择共享的内容）</li>
        </ul>

        <h2 className="text-base font-semibold text-text-primary mt-6">4. Cookie</h2>
        <p>我们使用必要的 Cookie 来维持登录状态（通过 Supabase Auth）。我们不使用跟踪 Cookie 或第三方广告 Cookie。</p>

        <h2 className="text-base font-semibold text-text-primary mt-6">5. 数据删除</h2>
        <p>您可以随时请求删除您的账户和所有关联数据。发送邮件至 support@scopeguard.app 即可，我们将在 7 个工作日内处理。</p>

        <h2 className="text-base font-semibold text-text-primary mt-6">6. 联系我们</h2>
        <p>如有任何隐私相关问题，请联系：support@scopeguard.app</p>
      </div>
    </main>
  )
}
