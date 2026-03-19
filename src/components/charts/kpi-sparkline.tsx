'use client'

import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface SparklineProps {
  data: number[]
  color: string
  height?: number
}

export function KpiSparkline({ data, color, height = 40 }: SparklineProps) {
  const chartData = data.map((v, i) => ({ i, v }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <XAxis dataKey="i" hide />
        <YAxis domain={[0, 1]} hide />
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          fill={color}
          fillOpacity={0.15}
          dot={false}
          strokeWidth={1.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
