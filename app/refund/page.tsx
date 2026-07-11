import Link from 'next/link'

export default function RefundPage() {
  return (
    <main className="max-w-lg mx-auto px-5 py-12">
      <Link href="/" className="text-sm text-brand hover:underline mb-6 inline-block">&larr; 返回首页</Link>
      <h1 className="text-2xl font-bold text-text-primary mb-6">退款政策</h1>

      <div className="text-sm text-text-secondary leading-relaxed space-y-4">
        <p>最后更新：2026 年 6 月 29 日</p>

        <h2 className="text-base font-semibold text-text-primary mt-6">14 天无理由退款</h2>
        <p>购买 ScopeGuard Pro 版后 14 天内，如果您觉得产品不符合预期，可以申请全额退款。不问理由。</p>

        <h2 className="text-base font-semibold text-text-primary mt-6">如何申请退款</h2>
        <p>发送邮件至 support@scopeguard.app，附上您的注册邮箱。我们将在 3-5 个工作日内处理退款。</p>

        <h2 className="text-base font-semibold text-text-primary mt-6">超过 14 天</h2>
        <p>超过 14 天的订阅按未使用月份比例退款。年度订阅按剩余月份比例计算。</p>

        <h2 className="text-base font-semibold text-text-primary mt-6">免费用户</h2>
        <p>免费版不涉及付费，无需退款。</p>
      </div>
    </main>
  )
}
