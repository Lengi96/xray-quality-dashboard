import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExecutionProgressBar } from '@/components/charts/execution-progress-bar'

interface ExecutionSummaryProps {
  planName: string | null
  total: number
  executed: number
  passed: number
  failed: number
  blocked: number
  todo: number
  progress: number
  passRate: number
}

export function ExecutionSummary({
  planName,
  total,
  executed,
  passed,
  failed,
  blocked,
  todo,
  progress,
  passRate,
}: ExecutionSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{planName ? `Test Plan: ${planName}` : 'Execution Summary'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ExecutionProgressBar total={total} executed={executed} progress={progress} />

        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{passed}</div>
            <div className="text-xs text-green-600 font-medium mt-1">Passed</div>
          </div>
          <div className="rounded-lg bg-red-50 p-3 text-center">
            <div className="text-2xl font-bold text-red-700">{failed}</div>
            <div className="text-xs text-red-600 font-medium mt-1">Failed</div>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 text-center">
            <div className="text-2xl font-bold text-amber-700">{blocked}</div>
            <div className="text-xs text-amber-600 font-medium mt-1">Blocked</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <div className="text-2xl font-bold text-gray-700">{todo}</div>
            <div className="text-xs text-gray-500 font-medium mt-1">Todo</div>
          </div>
        </div>

        {executed > 0 && (
          <div className="text-sm text-gray-500 text-center">
            Pass rate: <span className="font-semibold text-gray-900">{(passRate * 100).toFixed(1)}%</span>
            {' '}({passed}/{executed} passed)
          </div>
        )}
      </CardContent>
    </Card>
  )
}
