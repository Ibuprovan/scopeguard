'use client'

import type { ScopeRequest } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ChangeOrderPreviewProps {
  requests: ScopeRequest[]
  hourlyRate: number
  onGenerate?: () => void
  onShare?: () => void
  hasExistingOrder?: boolean
  orderStatus?: string
}

export function ChangeOrderPreview({ requests, hourlyRate, onGenerate, onShare, hasExistingOrder, orderStatus }: ChangeOrderPreviewProps) {
  const outOfScopeRequests = requests.filter(r => r.is_out_of_scope && r.status !== 'quoted' && r.status !== 'included_in_quote')
  const totalHours = outOfScopeRequests.reduce((sum, r) => sum + (r.estimated_hours ?? 0), 0)
  const totalAmount = totalHours * hourlyRate

  return (
    <div className="space-y-4">
      <div className="bg-surface-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">变更报价单</h3>
          <Badge variant="green">
            已激活
          </Badge>
        </div>

        {outOfScopeRequests.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center">
            {hasExistingOrder ? '报价单已生成，暂无新增超范围需求' : '暂无超范围需求'}
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {outOfScopeRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm text-text-primary truncate">{req.description}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      预估 {req.estimated_hours ?? '?'}h × ¥{hourlyRate}/h
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-text-primary font-mono whitespace-nowrap">
                    ¥{((req.estimated_hours ?? 0) * hourlyRate).toFixed(0)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-sm text-text-secondary">合计</span>
              <span className="text-xl font-bold text-brand font-mono">¥{totalAmount.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {outOfScopeRequests.length > 0 && (
        <div className="space-y-3">
          <Button onClick={onGenerate} fullWidth>
            {hasExistingOrder ? '重新生成报价单' : '生成正式报价单'}
          </Button>
          {hasExistingOrder && (
            <Button onClick={onShare} variant="secondary" fullWidth>
              {orderStatus === 'sent' ? '复制分享链接' : '发送并复制分享链接'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
