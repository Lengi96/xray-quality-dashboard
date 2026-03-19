'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

type BadgeVariant = 'success' | 'danger' | 'warning' | 'default' | 'info' | 'secondary'

interface ExecutionResult {
  id: string
  status: string
  executedAt: string | Date | null
  executedBy: string | null
  isFlaky: boolean
  testCase: {
    externalId: string
    title: string
    testType: string
    labels: string[]
  }
}

interface ExecutionResultsTableProps {
  items: ExecutionResult[]
  total: number
}

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  PASS: 'success',
  FAIL: 'danger',
  BLOCKED: 'warning',
  TODO: 'default',
  EXECUTING: 'info',
  ABORTED: 'secondary',
}

const STATUS_LABELS: Record<string, string> = {
  PASS: 'Pass',
  FAIL: 'Fail',
  BLOCKED: 'Blocked',
  TODO: 'Todo',
  EXECUTING: 'Executing',
  ABORTED: 'Aborted',
}

const STATUSES = ['PASS', 'FAIL', 'BLOCKED', 'TODO', 'EXECUTING', 'ABORTED']

export function ExecutionResultsTable({ items, total }: ExecutionResultsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('')

  const filtered = items.filter(item => {
    if (statusFilter && item.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{total} executions</span>
        <div className="ml-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-12">
          <p className="text-sm text-gray-400">No executions found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Test Key</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Executed By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Flaky?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(exec => (
                <tr key={exec.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{exec.testCase.externalId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{exec.testCase.title}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[exec.status] ?? 'default'}>
                      {STATUS_LABELS[exec.status] ?? exec.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="default">{exec.testCase.testType}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {exec.executedBy ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {exec.executedAt ? formatDate(exec.executedAt) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {exec.isFlaky && (
                      <Badge variant="warning">Flaky</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
