import { cn, formatPercent } from '@/lib/utils'

interface ExecutionProgressBarProps {
  total: number
  executed: number
  progress: number
}

function getColorClass(progress: number): string {
  if (progress >= 0.8) return 'bg-green-500'
  if (progress >= 0.5) return 'bg-amber-500'
  return 'bg-red-500'
}

function getTextColorClass(progress: number): string {
  if (progress >= 0.8) return 'text-green-700'
  if (progress >= 0.5) return 'text-amber-700'
  return 'text-red-700'
}

export function ExecutionProgressBar({ total, executed, progress }: ExecutionProgressBarProps) {
  const pct = Math.min(100, Math.max(0, progress * 100))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Execution Progress</span>
        <span className={cn('text-sm font-semibold', getTextColorClass(progress))}>
          {formatPercent(progress, 0)} complete
        </span>
      </div>
      <div className="h-4 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getColorClass(progress))}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{executed} executed</span>
        <span>{total} total</span>
      </div>
    </div>
  )
}
