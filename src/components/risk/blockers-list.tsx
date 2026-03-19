import { Badge } from '@/components/ui/badge'

interface CriticalDefect {
  id: string
  externalId: string
  title: string
  status: string
  assignee: string | null
}

interface FailedExecution {
  id: string
  testCase: {
    externalId: string
    title: string
    coverageLinks: Array<{
      requirement: {
        externalId: string
        title: string
        priority: string | null
      }
    }>
  }
}

interface BlockersListProps {
  criticalDefects: CriticalDefect[]
  failedOnCritical: FailedExecution[]
}

export function BlockersList({ criticalDefects, failedOnCritical }: BlockersListProps) {
  const hasBlockers = criticalDefects.length > 0 || failedOnCritical.length > 0

  if (!hasBlockers) {
    return (
      <div className="py-6 text-center text-sm text-gray-400">
        No release blockers detected
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {criticalDefects.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
            Critical Open Defects ({criticalDefects.length})
          </h4>
          <ul className="divide-y divide-gray-50">
            {criticalDefects.map((defect) => (
              <li key={defect.id} className="py-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono text-gray-500 shrink-0">
                    {defect.externalId}
                  </span>
                  <span className="text-sm text-gray-900 truncate">{defect.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="danger">CRITICAL</Badge>
                  <span className="text-xs text-gray-500">{defect.status}</span>
                  {defect.assignee && (
                    <span className="text-xs text-gray-400">{defect.assignee}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {failedOnCritical.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
            Failed Tests ({failedOnCritical.length})
          </h4>
          <ul className="divide-y divide-gray-50">
            {failedOnCritical.map((exec) => (
              <li key={exec.id} className="py-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono text-gray-500 shrink-0">
                    {exec.testCase.externalId}
                  </span>
                  <span className="text-sm text-gray-900 truncate">{exec.testCase.title}</span>
                  <Badge variant="danger">FAIL</Badge>
                </div>
                {exec.testCase.coverageLinks.length > 0 && (
                  <div className="ml-4 text-xs text-gray-400">
                    Covers:{' '}
                    {exec.testCase.coverageLinks
                      .map((cl) => `${cl.requirement.externalId} (${cl.requirement.priority ?? 'no priority'})`)
                      .join(', ')}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
