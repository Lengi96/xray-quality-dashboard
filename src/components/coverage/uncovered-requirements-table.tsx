'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Requirement {
  id: string
  externalId: string
  title: string
  type: string
  priority: string | null
  epicKey: string | null
  status: string
}

interface UncoveredRequirementsTableProps {
  items: Requirement[]
  total: number
}

const PRIORITY_VARIANTS: Record<string, 'danger' | 'warning' | 'info' | 'default'> = {
  Highest: 'danger',
  High: 'danger',
  Medium: 'warning',
  Low: 'info',
  Lowest: 'default',
}

const TYPE_VARIANTS: Record<string, 'secondary' | 'info' | 'default'> = {
  EPIC: 'secondary',
  STORY: 'info',
  TASK: 'default',
}

export function UncoveredRequirementsTable({ items, total }: UncoveredRequirementsTableProps) {
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const filtered = items.filter(item => {
    if (priorityFilter && item.priority !== priorityFilter) return false
    if (typeFilter && item.type !== typeFilter) return false
    return true
  })

  const priorities = Array.from(new Set(items.map(i => i.priority).filter(Boolean))) as string[]
  const types = Array.from(new Set(items.map(i => i.type)))

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{total} uncovered requirements</span>
        <div className="ml-auto flex gap-2">
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            {priorities.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-12">
          <p className="text-sm text-gray-400">No requirements found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Key</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Epic</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(req => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{req.externalId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{req.title}</td>
                  <td className="px-4 py-3">
                    <Badge variant={TYPE_VARIANTS[req.type] ?? 'default'}>{req.type}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {req.priority ? (
                      <Badge variant={PRIORITY_VARIANTS[req.priority] ?? 'default'}>{req.priority}</Badge>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                    {req.epicKey ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/coverage/${req.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
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
