'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface TrendDataPoint {
  date: string
  score: number
  tier: string
}

interface TrendLineProps {
  data: TrendDataPoint[]
  height?: number
}

const TIER_COLORS: Record<string, string> = {
  GREEN: '#22c55e',
  AMBER: '#f59e0b',
  RED: '#ef4444',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function TrendLine({ data, height = 220 }: TrendLineProps) {
  const latestTier = data.length > 0 ? data[data.length - 1].tier : 'AMBER'
  const lineColor = TIER_COLORS[latestTier] ?? '#6b7280'

  const formatted = data.map((d) => ({
    ...d,
    label: formatDate(d.date),
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={formatted} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0].payload as TrendDataPoint & { label: string }
            const tierColor = TIER_COLORS[item.tier] ?? '#6b7280'
            return (
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-md">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="mt-1 text-sm font-semibold" style={{ color: tierColor }}>
                  Score: {Math.round(item.score)}
                </p>
                <p className="text-xs text-gray-500">Tier: {item.tier}</p>
              </div>
            )
          }}
        />
        <ReferenceLine
          y={75}
          stroke="#22c55e"
          strokeDasharray="4 4"
          strokeOpacity={0.5}
          label={{ value: 'Green', position: 'right', fontSize: 10, fill: '#22c55e' }}
        />
        <ReferenceLine
          y={50}
          stroke="#f59e0b"
          strokeDasharray="4 4"
          strokeOpacity={0.5}
          label={{ value: 'Amber', position: 'right', fontSize: 10, fill: '#f59e0b' }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
