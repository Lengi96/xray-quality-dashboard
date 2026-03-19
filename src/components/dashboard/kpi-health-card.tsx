import { Card, CardContent } from '@/components/ui/card'
import { KpiSparkline } from '@/components/charts/kpi-sparkline'

interface KpiHealthCardProps {
  title: string
  value: number
  unit?: string
  trend?: 'up' | 'down' | 'flat'
  trendValue?: number
  history?: number[]
  thresholds?: { green: number; amber: number }
  description?: string
}

const DEFAULT_THRESHOLDS = { green: 0.75, amber: 0.50 }

function getStatus(
  value: number,
  thresholds: { green: number; amber: number }
): 'green' | 'amber' | 'red' {
  if (value >= thresholds.green) return 'green'
  if (value >= thresholds.amber) return 'amber'
  return 'red'
}

const STATUS_COLORS = {
  green: { text: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500', spark: '#22c55e' },
  amber: { text: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500', spark: '#f59e0b' },
  red:   { text: 'text-red-600',   bg: 'bg-red-50',   dot: 'bg-red-500',   spark: '#ef4444' },
}

function TrendArrow({ trend, trendValue }: { trend?: 'up' | 'down' | 'flat'; trendValue?: number }) {
  if (!trend) return null
  const sign = trendValue !== undefined && trendValue !== 0
    ? (trendValue > 0 ? '+' : '')
    : ''
  const delta = trendValue !== undefined
    ? `${sign}${(trendValue * 100).toFixed(1)}%`
    : ''

  if (trend === 'up') {
    return (
      <span className="flex items-center gap-0.5 text-xs text-green-600">
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 2l4 6H2z" />
        </svg>
        {delta}
      </span>
    )
  }
  if (trend === 'down') {
    return (
      <span className="flex items-center gap-0.5 text-xs text-red-600">
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 10L2 4h8z" />
        </svg>
        {delta}
      </span>
    )
  }
  return (
    <span className="text-xs text-gray-400">
      <svg className="inline h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
        <rect x="1" y="5" width="10" height="2" rx="1" />
      </svg>
      {delta}
    </span>
  )
}

export function KpiHealthCard({
  title,
  value,
  unit = '%',
  trend,
  trendValue,
  history,
  thresholds = DEFAULT_THRESHOLDS,
  description,
}: KpiHealthCardProps) {
  const status = getStatus(value, thresholds)
  const colors = STATUS_COLORS[status]
  const displayValue = unit === '%'
    ? `${Math.round(value * 100)}%`
    : `${value}${unit}`

  return (
    <Card className="flex-1 min-w-0">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500 truncate">{title}</p>
            <p className={`mt-1 text-2xl font-bold ${colors.text}`}>{displayValue}</p>
            {description && (
              <p className="mt-0.5 text-xs text-gray-400 truncate">{description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`inline-flex h-2 w-2 rounded-full ${colors.dot}`} />
            <TrendArrow trend={trend} trendValue={trendValue} />
          </div>
        </div>

        {history && history.length > 1 && (
          <div className="mt-3">
            <KpiSparkline data={history} color={colors.spark} height={36} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
