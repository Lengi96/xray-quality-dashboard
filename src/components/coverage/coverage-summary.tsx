import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { formatPercent } from '@/lib/utils'

interface ByType {
  type: string
  total: number
  covered: number
}

interface CoverageSummaryProps {
  total: number
  covered: number
  uncovered: number
  rate: number
  byType: ByType[]
}

export function CoverageSummary({ total, covered, uncovered, rate, byType }: CoverageSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Coverage Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4 mb-6">
          <div>
            <div className="text-4xl font-bold text-gray-900">{formatPercent(rate, 1)}</div>
            <div className="text-sm text-gray-500 mt-1">Coverage Rate</div>
          </div>
          <div className="flex gap-6 pb-1">
            <div className="text-center">
              <div className="text-xl font-semibold text-green-600">{covered}</div>
              <div className="text-xs text-gray-500">Covered</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-red-500">{uncovered}</div>
              <div className="text-xs text-gray-500">Uncovered</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-gray-700">{total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>

        {byType.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">By Type</div>
            {byType.map(row => {
              const typeRate = row.total === 0 ? 0 : (row.covered / row.total) * 100
              return (
                <div key={row.type} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">{row.type}</span>
                    <span className="text-gray-500">
                      {row.covered}/{row.total}
                    </span>
                  </div>
                  <ProgressBar value={typeRate} showLabel />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
