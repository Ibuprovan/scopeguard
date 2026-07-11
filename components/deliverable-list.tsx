'use client'

import { useState } from 'react'
import type { Deliverable, DeliverableStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface DeliverableListProps {
  items: Deliverable[]
  onStatusChange: (id: string, status: DeliverableStatus) => void
  onDelete: (id: string) => void
  onEdit: (id: string, name: string) => void
}

const statusLabels: Record<DeliverableStatus, string> = {
  pending: '未开始',
  in_progress: '进行中',
  completed: '已完成',
}

const statusVariants: Record<DeliverableStatus, 'default' | 'green' | 'orange' | 'blue'> = {
  pending: 'default',
  in_progress: 'blue',
  completed: 'green',
}

export function DeliverableList({ items, onStatusChange, onDelete, onEdit }: DeliverableListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  function startEdit(item: Deliverable) {
    setEditingId(item.id)
    setEditValue(item.name)
  }

  function saveEdit(id: string) {
    if (editValue.trim()) {
      onEdit(id, editValue.trim())
    }
    setEditingId(null)
  }

  const nextStatus: Record<DeliverableStatus, DeliverableStatus> = {
    pending: 'in_progress',
    in_progress: 'completed',
    completed: 'pending',
  }

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div
          key={item.id}
          className="flex items-center gap-3 bg-surface-elevated rounded-xl p-3.5 border border-border group"
        >
          <button
            onClick={() => onStatusChange(item.id, nextStatus[item.status])}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              item.status === 'completed'
                ? 'bg-brand border-brand'
                : 'border-text-muted hover:border-brand'
            }`}
          >
            {item.status === 'completed' && (
              <svg className="w-3 h-3 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            {editingId === item.id ? (
              <input
                type="text"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={() => saveEdit(item.id)}
                onKeyDown={e => e.key === 'Enter' && saveEdit(item.id)}
                autoFocus
                className="w-full bg-surface-card border border-border rounded-lg px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-brand"
              />
            ) : (
              <p className={`text-sm text-text-primary truncate ${item.status === 'completed' ? 'line-through text-text-muted' : ''}`}>
                {item.name}
              </p>
            )}
          </div>

          <Badge variant={statusVariants[item.status]}>
            {statusLabels[item.status]}
          </Badge>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => startEdit(item)}
              className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-card transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-surface-card transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
