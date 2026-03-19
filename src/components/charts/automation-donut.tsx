'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatPercent } from '@/lib/utils'

interface AutomationDonutProps {
  automated: number
  manual: number
  generic: number
  automationRate: number
}

const COLORS = {
  Automated: '#22c55e',
  Manual: '#9ca3af',
  Generic: '#3b82f6',
}

export function AutomationDonut({
  automated,
  manual,
  generic,
  automationRate,
}: AutomationDonutProps) {
  const data = [
    { name: 'Automated', value: automated },
    { name: 'Manual', value: manual },
    { name: 'Generic', value: generic },
  ].filter((d) => d.value > 0)

  const total = automated + manual + generic

  if (total === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">
        No test cases
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
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
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
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        style={{ paddingBottom: 28 }}
      >
        <span className="text-2xl font-bold text-gray-900">
          {formatPercent(automationRate, 0)}
        </span>
        <span className="text-xs text-gray-500">Automated</span>
      </div>
    </div>
  )
}
