import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'green' | 'orange' | 'blue'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const styles: Record<string, string> = {
    default: 'bg-[#1A1E28] text-[#9CA3AF] border-[#2A2F3C]',
    green: 'bg-brand-dim text-[#10B981] border-[#10B981]',
    orange: 'bg-danger-dim text-[#F97316] border-[#F97316]',
    blue: 'bg-[rgba(59,130,246,0.15)] text-[#3B82F6] border-[#3B82F6]',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-md border ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}
