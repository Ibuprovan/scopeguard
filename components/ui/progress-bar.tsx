interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md'
  label?: string
  className?: string
}

export function ProgressBar({ value, max = 100, showLabel = true, size = 'md', label, className = '' }: ProgressBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100)

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-text-secondary mb-1.5">
          <span>{label || '进度'}</span>
          <span className="font-mono">{pct}%</span>
        </div>
      )}
      <div className={`w-full bg-[#1A1E28] rounded-full overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2.5'}`}>
        <div
          className="h-full bg-[#10B981] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
