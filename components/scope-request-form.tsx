'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

interface ScopeRequestFormProps {
  onSave: (data: { description: string; estimated_hours: number; is_out_of_scope: boolean }) => Promise<void>
}

export function ScopeRequestForm({ onSave }: ScopeRequestFormProps) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [hours, setHours] = useState('')
  const [isOutOfScope, setIsOutOfScope] = useState(true)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!description.trim()) return
    setSaving(true)
    try {
      await onSave({
        description: description.trim(),
        estimated_hours: hours ? parseFloat(hours) : 0,
        is_out_of_scope: isOutOfScope,
      })
      setDescription('')
      setHours('')
      setIsOutOfScope(true)
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-brand text-surface shadow-lg shadow-brand/25 hover:bg-brand-hover active:scale-95 transition-all flex items-center justify-center"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="标记新增需求">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">需求描述</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="客户提出什么需求？"
              rows={3}
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">估算工时（小时）</label>
            <input
              type="number"
              value={hours}
              onChange={e => setHours(e.target.value)}
              placeholder="例如：4"
              min={0}
              step={0.5}
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">需求类型</label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOutOfScope(true)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-colors ${
                  isOutOfScope
                    ? 'bg-danger-dim border-danger text-danger'
                    : 'bg-surface-elevated border-border text-text-muted hover:text-text-secondary'
                }`}
              >
                超范围新增
              </button>
              <button
                onClick={() => setIsOutOfScope(false)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-colors ${
                  !isOutOfScope
                    ? 'bg-brand-dim border-brand text-brand'
                    : 'bg-surface-elevated border-border text-text-muted hover:text-text-secondary'
                }`}
              >
                合同内修订
              </button>
            </div>
          </div>

          <Button
            onClick={handleSave}
            fullWidth
            loading={saving}
            disabled={!description.trim()}
          >
            保存标记
          </Button>
        </div>
      </Modal>
    </>
  )
}
