import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  className?: string
  showLabel?: boolean
}

function getColorClass(value: number): string {
  if (value >= 75) return 'bg-green-500'
  if (value >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

export function ProgressBar({ value, className, showLabel = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', getColorClass(clamped))}
            style={{ width: `${clamped}%` }}
          />
        </div>
        {showLabel && (
          <span className="text-xs font-medium text-gray-600 w-10 text-right">
            {clamped.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  )
}
