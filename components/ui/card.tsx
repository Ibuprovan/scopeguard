import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  accent?: 'green' | 'orange' | 'none'
  onClick?: () => void
}

export function Card({ children, className = '', accent = 'none', onClick }: CardProps) {
  const accentBorder =
    accent === 'green'
      ? 'border-l-2 border-l-[#10B981]'
      : accent === 'orange'
        ? 'border-l-2 border-l-[#F97316]'
        : ''

  return (
    <div
      className={`bg-[#12151C] border border-[#2A2F3C] rounded-xl p-5 ${accentBorder} ${onClick ? 'cursor-pointer hover:border-[#3D4455] transition-colors' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
