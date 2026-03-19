import { cn } from '@/lib/utils'
import type { ReadinessTier } from '@/types/domain'

interface TrafficLightProps {
  tier: ReadinessTier
  label?: string
  className?: string
}

const tierConfig: Record<
  ReadinessTier,
  { color: string; bg: string; dot: string; text: string }
> = {
  GREEN: {
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
    dot: 'bg-green-500',
    text: 'Green',
  },
  AMBER: {
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
    text: 'Amber',
  },
  RED: {
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    dot: 'bg-red-500',
    text: 'Red',
  },
}

export function TrafficLight({ tier, label, className }: TrafficLightProps) {
  const config = tierConfig[tier]
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1',
        config.bg,
        className
      )}
    >
      <span className={cn('h-2.5 w-2.5 rounded-full', config.dot)} />
      <span className={cn('text-sm font-medium', config.color)}>
        {label ?? config.text}
      </span>
    </div>
  )
}
