interface FlakyExecution {
  id: string
  flakyScore: number | null
  testCase: {
    externalId: string
    title: string
    testType: string
  }
}

interface FlakyTestListProps {
  items: FlakyExecution[]
}

export function FlakyTestList({ items }: FlakyTestListProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        No flaky tests detected
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 w-28">Test Key</th>
            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Title</th>
            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 w-24">Type</th>
            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 w-40">
              Flaky Score
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((execution) => {
            const score = execution.flakyScore ?? 0
            const pct = Math.round(score * 100)
            return (
              <tr
                key={execution.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="py-2 px-3 text-xs font-mono text-gray-600">
                  {execution.testCase.externalId}
                </td>
                <td className="py-2 px-3 text-sm text-gray-900 max-w-xs truncate">
                  {execution.testCase.title}
                </td>
                <td className="py-2 px-3 text-xs text-gray-500">
                  {execution.testCase.testType.charAt(0) +
                    execution.testCase.testType.slice(1).toLowerCase()}
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-8 text-right">
                      {score.toFixed(2)}
                    </span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
