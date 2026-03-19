import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReadinessGauge } from '@/components/charts/readiness-gauge'

interface ReadinessScoreCardProps {
  score: number
  tier: 'GREEN' | 'AMBER' | 'RED'
  contributions?: {
    coverageRate: number
    executionProgress: number
    passRate: number
    automationRate: number
    defectPressure: number
  }
  snapshotAt?: string
}

const TIER_LABELS: Record<string, string> = {
  GREEN: 'Go-Live Ready',
  AMBER: 'Caution',
  RED: 'Not Ready',
}

const TIER_BADGE: Record<string, 'success' | 'warning' | 'danger'> = {
  GREEN: 'success',
  AMBER: 'warning',
  RED: 'danger',
}

const KPI_LABELS: Record<string, string> = {
  coverageRate: 'Coverage Rate',
  executionProgress: 'Execution Progress',
  passRate: 'Pass Rate',
  automationRate: 'Automation Rate',
  defectPressure: 'Defect Pressure',
}

function fmt(val: number): string {
  return `${Math.round(val * 100)}%`
}

function fmtDate(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ReadinessScoreCard({
  score,
  tier,
  contributions,
  snapshotAt,
}: ReadinessScoreCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Readiness Score</CardTitle>
          <Badge variant={TIER_BADGE[tier]}>
            {TIER_LABELS[tier] ?? tier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ReadinessGauge score={score} tier={tier} size="lg" />

        {contributions && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">KPI Contributions</p>
            <table className="w-full text-sm">
              <tbody>
                {(Object.keys(KPI_LABELS) as Array<keyof typeof KPI_LABELS>).map((key) => {
                  const val = contributions[key as keyof typeof contributions]
                  return (
                    <tr key={key} className="border-b border-gray-50 last:border-0">
                      <td className="py-1.5 text-gray-600">{KPI_LABELS[key]}</td>
                      <td className="py-1.5 text-right font-medium text-gray-900">
                        {fmt(val)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {snapshotAt && (
          <p className="mt-4 text-xs text-gray-400">
            Snapshot: {fmtDate(snapshotAt)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
