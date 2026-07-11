'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.push('/dashboard')
    }
    checkUser()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="bg-surface-card border border-border rounded-2xl p-8 w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-full bg-brand-dim flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">检查你的邮箱</h2>
        <p className="text-sm text-text-secondary">
          我们已向 <strong className="text-text-primary">{email}</strong> 发送了登录链接，点击即可登录。
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-8 w-full max-w-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold text-gradient mb-1">ScopeGuard</h1>
        <p className="text-sm text-text-secondary">输入邮箱，开始使用</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">邮箱地址</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
          />
        </div>

        {error && (
          <p className="text-sm text-danger bg-danger-dim rounded-lg p-3">{error}</p>
        )}

        <Button type="submit" fullWidth loading={loading} disabled={!email}>
          发送登录链接
        </Button>

        <p className="text-xs text-text-muted text-center">
          无需密码 · 点击链接即可登录
        </p>
      </form>
    </div>
  )
}
