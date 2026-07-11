import Link from 'next/link'
import { Button } from '@/components/ui/button'

const stats = [
  { num: '57%', label: '自由职业者每月因范围蔓延损失 $1,000+' },
  { num: '72%', label: '项目经历范围蔓延（远超行业平均 52%）' },
  { num: '$75', label: '实际时薪被无声稀释的典型结果（报价 $100/h）' },
  { num: '0', label: '市面上专用范围蔓延追踪工具数量' },
]

const features = [
  {
    num: 1,
    title: '范围边界设定器',
    desc: '项目开始时录入合同交付物清单，建立"范围基线"。每个交付物可标记状态，3分钟完成设定。',
  },
  {
    num: 2,
    title: '超范围标记 + 偏差看板',
    desc: '客户提出新需求时一键标记"超范围"或"合同内修订"，看板实时显示进度和偏差统计。',
  },
  {
    num: 3,
    title: '一键变更报价单',
    desc: '所有超范围需求自动汇总为专业变更报价单，一键发送客户确认，帮你"把钱要回来"。',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-brand-dim opacity-20 blur-[120px] -top-[200px] -right-[100px]" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-danger-dim opacity-20 blur-[120px] bottom-[20%] -left-[100px]" />
      </div>

      <div className="max-w-lg mx-auto px-5 py-16">
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 bg-brand-dim border border-brand rounded-full px-3.5 py-1.5 mb-6">
            <svg className="w-3.5 h-3.5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-xs font-semibold text-brand tracking-wider uppercase">3分钟上手</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            <span className="text-gradient">ScopeGuard</span>
          </h1>

          <p className="text-base text-text-secondary leading-relaxed max-w-sm mx-auto mb-8">
            让每一次
            <span className="text-danger font-semibold">"再加一个需求"</span>
            都可量化、可管理、可收费
          </p>

          <Link href="/login">
            <Button size="lg" className="px-8">
              开始免费使用
            </Button>
          </Link>
        </section>

        <section className="grid grid-cols-2 gap-3 mb-16">
          {stats.map((stat, i) => (
            <div key={i} className="bg-surface-card border border-border rounded-xl p-4 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand to-transparent opacity-30" />
              <p className="text-2xl font-bold text-brand mb-1">{stat.num}</p>
              <p className="text-xs text-text-muted leading-relaxed">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="mb-16">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand text-surface text-sm font-bold">3</span>
            MVP 功能，<span className="text-text-muted font-normal">一个都不多余</span>
          </h2>

          <div className="space-y-3">
            {features.map(f => (
              <div key={f.num} className="bg-surface-card border border-border rounded-xl p-5 hover:border-brand transition-colors">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg bg-brand text-surface text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {f.num}
                  </span>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">{f.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-brand">核心洞察</p>
          </div>
          <blockquote className="text-sm text-text-secondary leading-relaxed italic pl-3 border-l-2 border-brand">
            "你报了 $3,000 做 30 小时的项目（$100/小时）。范围蔓延悄悄多了 10 小时没付费，你的实际时薪降到了 $75。<br /><br />
            —— 这不是一个效率问题，这是一个金钱问题。"
            <cite className="block text-xs text-text-muted not-italic mt-2">— eOneBill</cite>
          </blockquote>
        </section>
      </div>
    </main>
  )
}
