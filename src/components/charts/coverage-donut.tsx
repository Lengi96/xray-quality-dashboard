'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatPercent } from '@/lib/utils'

interface CoverageDonutProps {
  covered: number
  uncovered: number
  rate: number
}

const COLORS = {
  covered: '#3b82f6',
  uncovered: '#e5e7eb',
}

export function CoverageDonut({ covered, uncovered, rate }: CoverageDonutProps) {
  const data = [
    { name: 'Covered', value: covered },
    { name: 'Uncovered', value: uncovered },
  ]

  const total = covered + uncovered

  if (total === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">
        No requirements data
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
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            <Cell key="covered" fill={COLORS.covered} />
            <Cell key="uncovered" fill={COLORS.uncovered} />
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
        <span className="text-2xl font-bold text-gray-900">{formatPercent(rate, 0)}</span>
        <span className="text-xs text-gray-500">Coverage</span>
      </div>
    </div>
  )
}
