'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getScopeRequests, deleteScopeRequest, updateScopeRequest } from '@/lib/actions/scope-requests'
import type { ScopeRequest } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatTimeAgo } from '@/lib/utils/format'

type FilterType = 'all' | 'out_of_scope' | 'in_scope'

export default function RequestsPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const [requests, setRequests] = useState<ScopeRequest[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDesc, setEditDesc] = useState('')
  const [editHours, setEditHours] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      getScopeRequests(id)
        .then(data => {
          setRequests(data as ScopeRequest[])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [user, authLoading, id])

  async function handleDelete(requestId: string) {
    await deleteScopeRequest(requestId)
    setRequests(prev => prev.filter(r => r.id !== requestId))
  }

  async function handleSaveEdit(requestId: string) {
    const updates: { description?: string; estimated_hours?: number; is_out_of_scope?: boolean } = {}
    if (editDesc.trim()) updates.description = editDesc.trim()
    if (editHours) updates.estimated_hours = parseFloat(editHours)
    if (Object.keys(updates).length === 0) {
      setEditingId(null)
      return
    }
    await updateScopeRequest(requestId, updates)
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...updates } : r as ScopeRequest))
    setEditingId(null)
  }

  const filtered = filter === 'all' ? requests : filter === 'out_of_scope' ? requests.filter(r => r.is_out_of_scope) : requests.filter(r => !r.is_out_of_scope)

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'out_of_scope', label: '超范围' },
    { key: 'in_scope', label: '合同内' },
  ]

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-5 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary p-1 -ml-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-text-primary">需求记录</h1>
      </div>

      <div className="flex gap-2 mb-5">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-brand text-surface'
                : 'bg-surface-elevated text-text-muted border border-border hover:text-text-secondary'
            }`}
          >
            {f.label}
            {f.key === 'all' && ` (${requests.length})`}
            {f.key === 'out_of_scope' && ` (${requests.filter(r => r.is_out_of_scope).length})`}
            {f.key === 'in_scope' && ` (${requests.filter(r => !r.is_out_of_scope).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface-card border border-border rounded-xl p-8 text-center">
          <p className="text-sm text-text-muted">
            {filter === 'all' ? '暂无需求记录' : filter === 'out_of_scope' ? '暂无超范围需求' : '暂无合同内修订'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(req => (
            <div key={req.id} className="bg-surface-card border border-border rounded-xl p-4">
              {editingId === req.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand resize-none"
                  />
                  <input
                    type="number"
                    value={editHours}
                    onChange={e => setEditHours(e.target.value)}
                    placeholder="工时 (h)"
                    className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveEdit(req.id)}>保存</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>取消</Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-text-primary mb-2">{req.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={req.is_out_of_scope ? 'orange' : 'green'}>
                      {req.is_out_of_scope ? '超范围' : '合同内'}
                    </Badge>
                    {req.estimated_hours && (
                      <span className="text-xs text-text-muted">{req.estimated_hours}h</span>
                    )}
                    <span className="text-xs text-text-muted">{formatTimeAgo(req.created_at)}</span>
                    <div className="ml-auto flex gap-1">
                      <button
                        onClick={() => {
                          setEditingId(req.id)
                          setEditDesc(req.description)
                          setEditHours(req.estimated_hours?.toString() ?? '')
                        }}
                        className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-elevated transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-surface-elevated transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
