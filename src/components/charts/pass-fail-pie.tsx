'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatPercent } from '@/lib/utils'

interface PassFailPieProps {
  passed: number
  failed: number
  blocked: number
  todo: number
  passRate: number
}

const SEGMENTS = [
  { key: 'passed', label: 'Pass', color: '#22c55e' },
  { key: 'failed', label: 'Fail', color: '#ef4444' },
  { key: 'blocked', label: 'Blocked', color: '#f59e0b' },
  { key: 'todo', label: 'Todo', color: '#9ca3af' },
]

export function PassFailPie({ passed, failed, blocked, todo, passRate }: PassFailPieProps) {
  const values: Record<string, number> = { passed, failed, blocked, todo }
  const data = SEGMENTS
    .map(s => ({ name: s.label, value: values[s.key], color: s.color }))
    .filter(d => d.value > 0)

  const total = passed + failed + blocked + todo

  if (total === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">
        No execution data
      </div>
    )
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={75}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" style={{ paddingBottom: 28 }}>
        <span className="text-2xl font-bold text-gray-900">{formatPercent(passRate, 0)}</span>
        <span className="text-xs text-gray-500">Pass Rate</span>
      </div>
    </div>
  )
}
