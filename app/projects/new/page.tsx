'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createProject } from '@/lib/actions/projects'
import { createDeliverable } from '@/lib/actions/deliverables'
import { ProjectForm } from '@/components/project-form'
import { Button } from '@/components/ui/button'

export default function NewProjectPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(data: { name: string; client_name: string; hourly_rate: string; deliverables: string }) {
    if (!user) return
    setSaving(true)
    setError('')

    const deliverableNames = data.deliverables
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)

    try {
      const newProject = await createProject({
        name: data.name,
        client_name: data.client_name,
        hourly_rate: parseFloat(data.hourly_rate),
      });

      await Promise.all(
        deliverableNames.map(name => createDeliverable(newProject.id, { name }))
      );

      router.push(`/projects/${newProject.id}`)
    } catch (err: any) {
      setError(err.message || '创建失败')
    }

    setSaving(false)
  }

  if (authLoading) {
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
        <div>
          <h1 className="text-xl font-bold text-text-primary">新建项目</h1>
          <p className="text-sm text-text-muted">设定范围基线，3分钟完成</p>
        </div>
      </div>

      {error && (
        <div className="bg-danger-dim border border-danger/30 rounded-xl p-4 mb-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <ProjectForm onSubmit={handleSubmit} loading={saving} />
    </main>
  )
}
