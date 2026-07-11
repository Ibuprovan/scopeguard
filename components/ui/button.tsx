'use client'

import { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

  const variants: Record<string, string> = {
    primary: 'bg-[#10B981] text-[#0B0D11] hover:bg-[#34D399]',
    secondary: 'bg-[#1A1E28] text-[#F4F4F5] border border-[#2A2F3C] hover:bg-[#2A2F3C] hover:border-[#3D4455]',
    ghost: 'text-[#9CA3AF] hover:text-[#F4F4F5] hover:bg-[#1A1E28]',
    danger: 'bg-[#F97316] text-white hover:bg-[#FB923C]',
  }

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
