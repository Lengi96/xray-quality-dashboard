interface ManualTestCase {
  id: string
  externalId: string
  title: string
  priority: string | null
  components: string[]
  _count: { executions: number }
}

interface AutomationGapTableProps {
  items: ManualTestCase[]
}

export function AutomationGapTable({ items }: AutomationGapTableProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        No manual test cases found
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
            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 w-28 text-right">
              Executions
            </th>
            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 w-24">Priority</th>
            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Components</th>
          </tr>
        </thead>
        <tbody>
          {items.map((tc, i) => (
            <tr
              key={tc.id}
              className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td className="py-2 px-3 text-xs font-mono text-gray-600">{tc.externalId}</td>
              <td className="py-2 px-3 text-sm text-gray-900 max-w-xs truncate">{tc.title}</td>
              <td className="py-2 px-3 text-right">
                <span
                  className={
                    i === 0
                      ? 'text-sm font-semibold text-amber-600'
                      : 'text-sm font-medium text-gray-700'
                  }
                >
                  {tc._count.executions}
                </span>
              </td>
              <td className="py-2 px-3 text-xs text-gray-500">{tc.priority ?? '—'}</td>
              <td className="py-2 px-3 text-xs text-gray-500">
                {tc.components.length > 0 ? tc.components.join(', ') : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
