'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface Defect {
  id: string
  externalId: string
  title: string
  severity: string
  status: string
  assignee: string | null
  createdAt: Date | string
}

interface DefectBreakdownTableProps {
  items: Defect[]
  total: number
}

const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'TRIVIAL']

function severityVariant(
  severity: string
): 'danger' | 'warning' | 'info' | 'default' | 'secondary' {
  switch (severity) {
    case 'CRITICAL':
      return 'danger'
    case 'HIGH':
      return 'warning'
    case 'MEDIUM':
      return 'warning'
    case 'LOW':
      return 'info'
    default:
      return 'default'
  }
}

function ageInDays(createdAt: Date | string): number {
  return Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )
}

export function DefectBreakdownTable({ items, total }: DefectBreakdownTableProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const CLOSED_STATUSES = ['Closed', 'Resolved', 'Done', 'Fixed']
  const statuses = Array.from(new Set(items.map((i) => i.status)))

  const filtered = items
    .filter((i) => filterSeverity === 'all' || i.severity === filterSeverity)
    .filter((i) => {
      if (filterStatus === 'all') return true
      if (filterStatus === 'open') return !CLOSED_STATUSES.includes(i.status)
      if (filterStatus === 'closed') return CLOSED_STATUSES.includes(i.status)
      return i.status === filterStatus
    })
    .sort(
      (a, b) =>
        SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    )

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Severity:</label>
          <select
            className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-700"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="all">All</option>
            {SEVERITY_ORDER.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Status:</label>
          <select
            className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-700"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs text-gray-400 self-center">
          Showing {filtered.length} of {total}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 w-24">Key</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Title</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 w-24">Severity</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 w-24">Status</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 w-20">Age</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 w-28">Assignee</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                  No defects match the selected filters
                </td>
              </tr>
            ) : (
              filtered.map((defect) => (
                <tr
                  key={defect.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 px-3 text-xs font-mono text-gray-600">
                    {defect.externalId}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-900 max-w-xs truncate">
                    {defect.title}
                  </td>
                  <td className="py-2 px-3">
                    <Badge variant={severityVariant(defect.severity)}>
                      {defect.severity.charAt(0) + defect.severity.slice(1).toLowerCase()}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-600">{defect.status}</td>
                  <td className="py-2 px-3 text-xs text-gray-500">
                    {ageInDays(defect.createdAt)}d
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-500">
                    {defect.assignee ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
