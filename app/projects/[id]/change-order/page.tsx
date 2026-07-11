'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getProject } from '@/lib/actions/projects'
import { getScopeRequests } from '@/lib/actions/scope-requests'
import { createChangeOrder, sendChangeOrder, getChangeOrder } from '@/lib/actions/change-orders'
import type { Project, ScopeRequest } from '@/types'
import { ChangeOrderPreview } from '@/components/change-order-preview'
import { Button } from '@/components/ui/button'

export default function ChangeOrderPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile, loading: authLoading } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [requests, setRequests] = useState<ScopeRequest[]>([])
  const [existingOrder, setExistingOrder] = useState<{ id: string; status: string; share_token: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      Promise.all([
        getProject(id),
        getScopeRequests(id),
        getChangeOrder(id),
      ]).then(([projectData, requestsData, orderData]) => {
        setProject(projectData as Project)
        setRequests(requestsData as ScopeRequest[])
        if (orderData) {
          setExistingOrder(orderData as { id: string; status: string; share_token: string | null })
          if (orderData.status === 'sent' && orderData.share_token) {
            setShareUrl(`${window.location.origin}/share/${orderData.share_token}`)
          }
        }
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [user, authLoading, id])

  const isPro = profile?.plan === 'pro'

  async function handleGenerate() {
    try {
      const order = await createChangeOrder(id)
      setExistingOrder(order as { id: string; status: string; share_token: string | null })
    } catch (err: any) {
      alert(err.message || '生成失败')
    }
  }

  async function handleShare() {
    if (!existingOrder) return
    try {
      const updated = await sendChangeOrder(existingOrder.id)
      if (updated.share_token) {
        const url = `${window.location.origin}/share/${updated.share_token}`
        setShareUrl(url)
        setExistingOrder(updated as { id: string; status: string; share_token: string | null })
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err: any) {
      alert(err.message || '发送失败')
    }
  }

  if (authLoading || loading || !project) {
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
          <h1 className="text-xl font-bold text-text-primary">变更报价单</h1>
          <p className="text-sm text-text-muted">{project.name} · {project.client_name}</p>
        </div>
      </div>

      {shareUrl && (
        <div className="bg-brand-dim border border-brand/30 rounded-xl p-4 mb-4">
          <p className="text-sm text-brand mb-2 font-medium">分享链接已复制到剪贴板</p>
          <p className="text-xs text-text-secondary break-all font-mono">{shareUrl}</p>
        </div>
      )}

      {copied && (
        <p className="text-xs text-brand mb-3 text-center">已复制到剪贴板</p>
      )}

      <ChangeOrderPreview
        requests={requests}
        hourlyRate={project.hourly_rate}
        isPro={isPro}
        onGenerate={handleGenerate}
        onShare={handleShare}
        hasExistingOrder={!!existingOrder}
        orderStatus={existingOrder?.status}
      />
    </main>
  )
}
