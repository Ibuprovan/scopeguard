'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { projectSchema } from '@/lib/utils/validators'

interface ProjectFormData {
  name: string
  client_name: string
  hourly_rate: string
  deliverables: string
}

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => Promise<void>
  loading?: boolean
}

export function ProjectForm({ onSubmit, loading }: ProjectFormProps) {
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [deliverables, setDeliverables] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const deliverableList = deliverables
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})

    const result = projectSchema.safeParse({ name, client_name: clientName, hourly_rate: hourlyRate ? parseFloat(hourlyRate) : 0 })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach(err => {
        fieldErrors[err.path[0] as string] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    if (deliverableList.length === 0) {
      setErrors({ deliverables: '至少输入一个交付物' })
      return
    }

    onSubmit({ name, client_name: clientName, hourly_rate: hourlyRate, deliverables })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">项目名称</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="例如：品牌VIS设计"
          className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
        />
        {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">客户名称</label>
        <input
          type="text"
          value={clientName}
          onChange={e => setClientName(e.target.value)}
          placeholder="例如：某科技有限公司"
          className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
        />
        {errors.client_name && <p className="text-xs text-danger mt-1">{errors.client_name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">时薪 (¥/h)</label>
        <input
          type="number"
          value={hourlyRate}
          onChange={e => setHourlyRate(e.target.value)}
          placeholder="例如：200"
          min={1}
          className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
        />
        {errors.hourly_rate && <p className="text-xs text-danger mt-1">{errors.hourly_rate}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          交付物清单
          <span className="text-text-muted font-normal ml-1">（每行一个交付物）</span>
        </label>
        <textarea
          value={deliverables}
          onChange={e => setDeliverables(e.target.value)}
          placeholder={'Logo设计（3稿）\n名片设计（正反面）\n信封设计\n信纸设计'}
          rows={5}
          className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors resize-none"
        />
        {errors.deliverables && <p className="text-xs text-danger mt-1">{errors.deliverables}</p>}
      </div>

      {deliverableList.length > 0 && (
        <div className="bg-surface-elevated rounded-xl p-4 border border-border">
          <p className="text-xs text-text-muted mb-2">已录入 {deliverableList.length} 个交付物：</p>
          <ul className="space-y-1">
            {deliverableList.map((d, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="w-5 h-5 rounded-full bg-brand-dim text-brand text-xs flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button type="submit" fullWidth loading={loading} size="lg">
        创建项目
      </Button>
    </form>
  )
}
