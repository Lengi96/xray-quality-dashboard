import { ProgressBar } from '@/components/ui/progress-bar'
import { formatPercent } from '@/lib/utils'

interface AutomationSummaryProps {
  total: number
  automated: number
  manual: number
  generic: number
  automationRate: number
}

export function AutomationSummary({
  total,
  automated,
  manual,
  generic,
  automationRate,
}: AutomationSummaryProps) {
  return (
    <div className="space-y-5">
      {/* Big rate number */}
      <div className="flex items-end gap-3">
        <span className="text-5xl font-bold text-gray-900">
          {formatPercent(automationRate, 1)}
        </span>
        <span className="text-sm text-gray-500 pb-2">automation rate</span>
      </div>

      {/* Progress bar */}
      <ProgressBar value={automationRate * 100} showLabel />

      {/* Count breakdown */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        <div className="text-center">
          <div className="text-2xl font-semibold text-green-600">{automated}</div>
          <div className="text-xs text-gray-500 mt-0.5">Automated</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-600">{manual}</div>
          <div className="text-xs text-gray-500 mt-0.5">Manual</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-blue-600">{generic}</div>
          <div className="text-xs text-gray-500 mt-0.5">Generic</div>
        </div>
      </div>

      <div className="text-xs text-gray-400 pt-1">
        {total} total test cases
      </div>
    </div>
  )
}
