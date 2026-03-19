import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BlockerSnapshot {
  openCritical: number
  totalRequirements: number
  coveredRequirements: number
  coverageRate: number
  passRate: number
  totalExecuted: number
  totalPassed: number
  flakyTestCount: number
}

interface BlockersPanelProps {
  snapshot: BlockerSnapshot | null
}

interface Blocker {
  message: string
  severity: 'critical' | 'warning'
}

function deriveBlockers(snapshot: BlockerSnapshot): Blocker[] {
  const blockers: Blocker[] = []

  if (snapshot.openCritical > 0) {
    blockers.push({
      message: `${snapshot.openCritical} critical defect${snapshot.openCritical > 1 ? 's' : ''} open`,
      severity: 'critical',
    })
  }

  if (snapshot.coverageRate < 0.75) {
    const uncovered = snapshot.totalRequirements - snapshot.coveredRequirements
    blockers.push({
      message: `${uncovered} requirement${uncovered !== 1 ? 's' : ''} uncovered`,
      severity: 'critical',
    })
  }

  if (snapshot.passRate < 0.80) {
    const failing = snapshot.totalExecuted - snapshot.totalPassed
    blockers.push({
      message: `${failing} test${failing !== 1 ? 's' : ''} failing`,
      severity: 'warning',
    })
  }

  if (snapshot.flakyTestCount > 0) {
    blockers.push({
      message: `${snapshot.flakyTestCount} flaky test${snapshot.flakyTestCount !== 1 ? 's' : ''} detected`,
      severity: 'warning',
    })
  }

  return blockers
}

export function BlockersPanel({ snapshot }: BlockersPanelProps) {
  if (!snapshot) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Release Blockers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">No snapshot data available.</p>
        </CardContent>
      </Card>
    )
  }

  const blockers = deriveBlockers(snapshot)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Release Blockers</CardTitle>
          {blockers.length === 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Clear
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              {blockers.length} issue{blockers.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {blockers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-green-700">No release blockers found</p>
            <p className="mt-1 text-xs text-gray-400">All quality gates passing</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {blockers.map((b, i) => (
              <li
                key={i}
                className={`flex items-start gap-3 rounded-lg p-3 ${
                  b.severity === 'critical'
                    ? 'bg-red-50 border border-red-100'
                    : 'bg-amber-50 border border-amber-100'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white ${
                    b.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                >
                  <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="currentColor">
                    <path d="M5 1v4M5 7v1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <span
                  className={`text-sm font-medium ${
                    b.severity === 'critical' ? 'text-red-700' : 'text-amber-700'
                  }`}
                >
                  {b.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
