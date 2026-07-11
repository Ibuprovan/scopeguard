'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getProject } from '@/lib/actions/projects'
import { getDeliverables, updateDeliverableStatus, deleteDeliverable, updateDeliverable } from '@/lib/actions/deliverables'
import { getScopeRequests, createScopeRequest, deleteScopeRequest } from '@/lib/actions/scope-requests'
import type { Project, Deliverable, DeliverableStatus, ScopeRequest } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeliverableList } from '@/components/deliverable-list'
import { ScopeRequestForm } from '@/components/scope-request-form'
import { DeviationDashboard } from '@/components/deviation-dashboard'
import { formatTimeAgo } from '@/lib/utils/format'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [requests, setRequests] = useState<ScopeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()

  async function loadData() {
    if (!user) return
    setLoading(true)

    try {
      const [projectData, deliverablesData, requestsData] = await Promise.all([
        getProject(id),
        getDeliverables(id),
        getScopeRequests(id),
      ])
      setProject(projectData as Project)
      setDeliverables(deliverablesData as Deliverable[])
      setRequests(requestsData as ScopeRequest[])
    } catch {
      setNotFound(true)
    }

    setLoading(false)
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (user) loadData()
  }, [user, authLoading, id])

  async function handleStatusChange(deliverableId: string, status: DeliverableStatus) {
    await updateDeliverableStatus(deliverableId, status)
    setDeliverables(prev => prev.map(d => d.id === deliverableId ? { ...d, status } : d))
  }

  async function handleDeleteDeliverable(deliverableId: string) {
    await deleteDeliverable(deliverableId)
    setDeliverables(prev => prev.filter(d => d.id !== deliverableId))
  }

  async function handleEditDeliverable(deliverableId: string, name: string) {
    await updateDeliverable(deliverableId, { name })
    setDeliverables(prev => prev.map(d => d.id === deliverableId ? { ...d, name } : d))
  }

  async function handleSaveScopeRequest(data: { description: string; estimated_hours: number; is_out_of_scope: boolean }) {
    const newRequest = await createScopeRequest(id, data)
    setRequests(prev => [newRequest as ScopeRequest, ...prev])
  }

  async function handleDeleteRequest(requestId: string) {
    await deleteScopeRequest(requestId)
    setRequests(prev => prev.filter(r => r.id !== requestId))
  }

  const outOfScopeRequests = requests.filter(r => r.is_out_of_scope)
  const extraHours = outOfScopeRequests.reduce((sum, r) => sum + (r.estimated_hours ?? 0), 0)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-text-muted mb-3">项目不存在或无权访问</p>
          <Button size="sm" onClick={() => router.push('/dashboard')}>返回仪表盘</Button>
        </div>
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text-primary truncate">{project.name}</h1>
            <Badge variant={project.status === 'active' ? 'green' : 'default'}>
              {project.status === 'active' ? '进行中' : project.status === 'completed' ? '已完成' : '已归档'}
            </Badge>
          </div>
          <p className="text-sm text-text-muted">{project.client_name}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-text-primary mb-3">交付物清单</h2>
        {deliverables.length > 0 ? (
          <DeliverableList
            items={deliverables}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteDeliverable}
            onEdit={handleEditDeliverable}
          />
        ) : (
          <p className="text-sm text-text-muted text-center py-4">暂无交付物</p>
        )}
      </section>

      <section className="mb-8">
        <DeviationDashboard
          totalDeliverables={deliverables.length}
          completedDeliverables={deliverables.filter(d => d.status === 'completed').length}
          inProgressDeliverables={deliverables.filter(d => d.status === 'in_progress').length}
          overscopeCount={outOfScopeRequests.length}
          extraHours={extraHours}
          hourlyRate={project.hourly_rate}
        />
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text-primary">需求时间线</h2>
          {requests.length > 0 && (
            <button
              onClick={() => router.push(`/projects/${id}/requests`)}
              className="text-xs text-brand hover:text-brand-hover transition-colors"
            >
              查看全部
            </button>
          )}
        </div>
        {requests.length > 0 ? (
          <div className="space-y-2">
            {requests.slice(0, 5).map(req => (
              <div key={req.id} className="flex items-start gap-3 bg-surface-elevated border border-border rounded-xl p-3.5">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${req.is_out_of_scope ? 'bg-danger' : 'bg-brand'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{req.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={req.is_out_of_scope ? 'orange' : 'green'}>
                      {req.is_out_of_scope ? '超范围' : '合同内'}
                    </Badge>
                    {req.estimated_hours && (
                      <span className="text-xs text-text-muted">{req.estimated_hours}h</span>
                    )}
                    <span className="text-xs text-text-muted">{formatTimeAgo(req.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteRequest(req.id)}
                  className="text-text-muted hover:text-danger p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-elevated border border-border rounded-xl p-6 text-center">
            <p className="text-sm text-text-muted">暂无需求记录</p>
            <p className="text-xs text-text-muted mt-1">点击右下角 + 按钮标记第一个需求</p>
          </div>
        )}
      </section>

      {outOfScopeRequests.length > 0 && (
        <section className="mb-8">
          <Button
            fullWidth
            onClick={() => router.push(`/projects/${id}/change-order`)}
          >
            生成变更报价单
          </Button>
        </section>
      )}

      <ScopeRequestForm onSave={handleSaveScopeRequest} />
    </main>
  )
}
