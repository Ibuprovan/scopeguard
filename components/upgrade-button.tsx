'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { getProCheckoutUrl } from '@/lib/lemonsqueezy'

interface UpgradeButtonProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function UpgradeButton({ label = '升级到 Pro', size = 'sm', fullWidth = false }: UpgradeButtonProps) {
  const { user } = useAuth()

  function handleUpgrade() {
    const url = getProCheckoutUrl(user?.email || undefined)
    window.open(url, '_blank')
  }

  return (
    <Button size={size} fullWidth={fullWidth} onClick={handleUpgrade}>
      {label}
    </Button>
  )
}
