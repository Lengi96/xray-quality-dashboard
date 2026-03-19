'use client'

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from 'recharts'

interface ReadinessGaugeProps {
  score: number
  tier: 'GREEN' | 'AMBER' | 'RED'
  size?: 'sm' | 'md' | 'lg'
}

const TIER_COLORS: Record<string, string> = {
  GREEN: '#22c55e',
  AMBER: '#f59e0b',
  RED: '#ef4444',
}

export function ReadinessGauge({ score, tier, size = 'md' }: ReadinessGaugeProps) {
  const color = TIER_COLORS[tier] ?? '#6b7280'
  const data = [{ value: score, fill: color }]
  const height = size === 'lg' ? 220 : size === 'md' ? 170 : 130

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="80%"
          innerRadius="60%"
          outerRadius="90%"
          startAngle={180}
          endAngle={0}
          data={data}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: '#f3f4f6' } as Record<string, unknown>}
            dataKey="value"
            cornerRadius={6}
            angleAxisId={0}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      {/* Score overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
        <span className="text-4xl font-bold" style={{ color }}>
          {Math.round(score)}
        </span>
        <span className="text-sm text-gray-500">/ 100</span>
      </div>
    </div>
  )
}
