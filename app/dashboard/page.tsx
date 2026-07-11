'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getProjects } from '@/lib/actions/projects'
import type { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }

    getProjects()
      .then(data => {
        setProjects(data as Project[])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-5 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            {profile?.name ? `${profile.name}，你好` : '你好'}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">ScopeGuard 仪表盘</p>
        </div>
        <button
          onClick={async () => {
            await signOut()
            router.push('/')
          }}
          className="text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          退出登录
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-text-primary">我的项目</h2>
        <Button size="sm" onClick={() => router.push('/projects/new')}>
          新建项目
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-surface-card border border-border rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-dim flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary mb-1">还没有项目</p>
          <p className="text-xs text-text-muted mb-4">新建一个项目开始追踪范围</p>
          <Button size="sm" onClick={() => router.push('/projects/new')}>
            创建第一个项目
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <Card key={project.id} onClick={() => router.push(`/projects/${project.id}`)}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-text-primary truncate">{project.name}</h3>
                <Badge variant={project.status === 'active' ? 'green' : project.status === 'completed' ? 'blue' : 'default'}>
                  {project.status === 'active' ? '进行中' : project.status === 'completed' ? '已完成' : '已归档'}
                </Badge>
              </div>
              <p className="text-sm text-text-muted">{project.client_name}</p>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
