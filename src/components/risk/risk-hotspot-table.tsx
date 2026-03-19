import { Badge } from '@/components/ui/badge'

interface Requirement {
  id: string
  externalId: string
  title: string
  priority: string | null
  type: string
}

interface RiskHotspotTableProps {
  items: Requirement[]
}

export function RiskHotspotTable({ items }: RiskHotspotTableProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        All requirements have test coverage
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 w-28">Key</th>
            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Title</th>
            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 w-24">Priority</th>
            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 w-24">Coverage</th>
            <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 w-24">Issue</th>
          </tr>
        </thead>
        <tbody>
          {items.map((req) => (
            <tr
              key={req.id}
              className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td className="py-2 px-3 text-xs font-mono text-gray-600">{req.externalId}</td>
              <td className="py-2 px-3 text-sm text-gray-900 max-w-xs truncate">{req.title}</td>
              <td className="py-2 px-3 text-xs text-gray-500">{req.priority ?? '—'}</td>
              <td className="py-2 px-3 text-xs text-gray-500">0%</td>
              <td className="py-2 px-3">
                <Badge variant="danger">No tests</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
