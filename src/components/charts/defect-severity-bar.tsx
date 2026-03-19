'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts'

interface DefectSeverityBarProps {
  bySeverity: Record<string, number>
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#3b82f6',
  TRIVIAL: '#9ca3af',
}

const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'TRIVIAL']

export function DefectSeverityBar({ bySeverity }: DefectSeverityBarProps) {
  const data = SEVERITY_ORDER.map((severity) => ({
    name: severity.charAt(0) + severity.slice(1).toLowerCase(),
    value: bySeverity[severity] ?? 0,
    severity,
  }))

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">
        No open defects
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(value) => [value, 'Open defects']}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
