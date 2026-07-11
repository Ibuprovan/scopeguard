interface DeviationDashboardProps {
  totalDeliverables: number
  completedDeliverables: number
  inProgressDeliverables: number
  overscopeCount: number
  extraHours: number
  hourlyRate: number
}

export function DeviationDashboard({
  totalDeliverables,
  completedDeliverables,
  inProgressDeliverables,
  overscopeCount,
  extraHours,
  hourlyRate,
}: DeviationDashboardProps) {
  const progressPct = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0
  const lostIncome = extraHours * hourlyRate

  const originalScope = totalDeliverables
  const actualScope = totalDeliverables + overscopeCount
  const scopeCreepPct = originalScope > 0 ? Math.round((overscopeCount / originalScope) * 100) : 0

  const originalHours = totalDeliverables * 8
  const actualHours = originalHours + extraHours
  const hoursOverrunPct = originalHours > 0 ? Math.round((extraHours / originalHours) * 100) : 0

  const originalBudget = originalHours * hourlyRate
  const actualBudget = originalBudget + lostIncome

  const stats = [
    {
      label: '合同进度',
      value: `${completedDeliverables}/${totalDeliverables}`,
      sub: `完成 ${progressPct}%`,
      accent: 'green',
    },
    {
      label: '超范围新增',
      value: `${overscopeCount}项`,
      sub: `进行中 ${inProgressDeliverables}项`,
      accent: overscopeCount > 0 ? 'orange' : 'default',
    },
    {
      label: '额外工时',
      value: `${extraHours.toFixed(1)}h`,
      sub: extraHours > 0 ? `≈ ${(extraHours / 8).toFixed(1)}个工作日` : '暂无超范围需求',
      accent: extraHours > 0 ? 'orange' : 'default',
    },
    {
      label: '时薪损失预估',
      value: `¥${lostIncome.toFixed(0)}`,
      sub: `时薪 ¥${hourlyRate}/h`,
      accent: lostIncome > 0 ? 'orange' : 'default',
    },
  ]

  const accentColors: Record<string, string> = {
    green: 'text-brand',
    orange: 'text-danger',
    default: 'text-text-primary',
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-surface-elevated border border-border rounded-xl p-4 relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-30 ${accentColors[stat.accent]}`} />
            <p className={`text-2xl font-bold mb-1 ${accentColors[stat.accent]}`}>
              {stat.value}
            </p>
            <p className="text-xs text-text-muted">{stat.label}</p>
            <p className="text-xs text-text-muted mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-elevated border border-border rounded-xl p-4">
        <h4 className="text-xs font-semibold text-text-secondary mb-3">时间线对比</h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-muted">范围蔓延</span>
              <span className={`text-xs font-mono ${scopeCreepPct > 0 ? 'text-danger' : 'text-text-muted'}`}>
                {originalScope} → {actualScope} {scopeCreepPct > 0 && `(+${scopeCreepPct}%)`}
              </span>
            </div>
            <div className="h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-danger rounded-full transition-all"
                style={{ width: `${Math.min(scopeCreepPct, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-muted">工时偏差</span>
              <span className={`text-xs font-mono ${hoursOverrunPct > 0 ? 'text-danger' : 'text-text-muted'}`}>
                {originalHours}h → {actualHours.toFixed(1)}h {hoursOverrunPct > 0 && `(+${hoursOverrunPct}%)`}
              </span>
            </div>
            <div className="h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-danger rounded-full transition-all"
                style={{ width: `${Math.min(hoursOverrunPct, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-muted">预算偏差</span>
              <span className={`text-xs font-mono ${lostIncome > 0 ? 'text-danger' : 'text-text-muted'}`}>
                ¥{originalBudget.toFixed(0)} → ¥{actualBudget.toFixed(0)}
              </span>
            </div>
            <div className="h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-danger rounded-full transition-all"
                style={{ width: `${originalBudget > 0 ? Math.min((lostIncome / originalBudget) * 100, 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
