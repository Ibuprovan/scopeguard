import Link from 'next/link'

export default function TosPage() {
  return (
    <main className="max-w-lg mx-auto px-5 py-12">
      <Link href="/" className="text-sm text-brand hover:underline mb-6 inline-block">&larr; 返回首页</Link>
      <h1 className="text-2xl font-bold text-text-primary mb-6">服务条款</h1>

      <div className="text-sm text-text-secondary leading-relaxed space-y-4">
        <p>最后更新：2026 年 6 月 29 日</p>

        <h2 className="text-base font-semibold text-text-primary mt-6">1. 服务说明</h2>
        <p>ScopeGuard 是一款帮助自由职业者追踪和管理合同范围蔓延的工具。我们提供免费版和付费 Pro 版。</p>

        <h2 className="text-base font-semibold text-text-primary mt-6">2. 账户</h2>
        <p>您需要注册账户才能使用本产品。您有责任维护账户安全。如果发现异常登录，请立即通知我们。</p>

        <h2 className="text-base font-semibold text-text-primary mt-6">3. 付费与订阅</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Pro 版按月或按年订阅</li>
          <li>14 天无理由退款保证</li>
          <li>取消订阅后，Pro 功能在当前账单周期结束时停止</li>
          <li>价格可能调整，已订阅用户在下次续费前不受影响</li>
        </ul>

        <h2 className="text-base font-semibold text-text-primary mt-6">4. 退款政策</h2>
        <p>购买 Pro 版后 14 天内可申请全额退款。超过 14 天或已生成变更报价单的订单按比例退款。退款请联系 support@scopeguard.app。</p>

        <h2 className="text-base font-semibold text-text-primary mt-6">5. 免责声明</h2>
        <p>本产品按"现状"提供。我们不对因使用本产品导致的任何直接或间接损失承担责任。ScopeGuard 是辅助工具，不具有法律约束力。</p>

        <h2 className="text-base font-semibold text-text-primary mt-6">6. 条款变更</h2>
        <p>我们可能不时更新本条款。重大变更将通过邮箱或产品内通知告知用户。</p>
      </div>
    </main>
  )
}
