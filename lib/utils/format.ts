export function formatCurrency(amount: number, currency: 'CNY' | 'USD' = 'CNY'): string {
  if (currency === 'CNY') return `¥${amount.toFixed(2)}`
  return `$${amount.toFixed(2)}`
}

export function formatHours(hours: number): string {
  return `${hours.toFixed(1)}h`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTimeAgo(date: string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  return formatDate(date)
}
