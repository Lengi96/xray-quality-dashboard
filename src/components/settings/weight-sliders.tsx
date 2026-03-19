'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface Weights {
  coverageRate: number
  executionProgress: number
  passRate: number
  automationRate: number
  defectPressure: number
}

interface WeightSlidersProps {
  projectId: string
  initialWeights?: Weights
  onSaved?: () => void
}

const WEIGHT_LABELS: Record<keyof Weights, string> = {
  coverageRate: 'Coverage',
  executionProgress: 'Execution Progress',
  passRate: 'Pass Rate',
  automationRate: 'Automation Rate',
  defectPressure: 'Defect Pressure',
}

const DEFAULT_WEIGHTS: Weights = {
  coverageRate: 25,
  executionProgress: 20,
  passRate: 25,
  automationRate: 10,
  defectPressure: 20,
}

function toPercent(weights: Weights): Weights {
  // Convert fractional (0-1) weights to integer percent (0-100)
  const sum = Object.values(weights).reduce((a, b) => a + b, 0)
  if (sum <= 1) {
    // Stored as fractions
    return {
      coverageRate: Math.round(weights.coverageRate * 100),
      executionProgress: Math.round(weights.executionProgress * 100),
      passRate: Math.round(weights.passRate * 100),
      automationRate: Math.round(weights.automationRate * 100),
      defectPressure: Math.round(weights.defectPressure * 100),
    }
  }
  return weights
}

export function WeightSliders({ projectId, initialWeights, onSaved }: WeightSlidersProps) {
  const [weights, setWeights] = useState<Weights>(
    initialWeights ? toPercent(initialWeights) : DEFAULT_WEIGHTS
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  const isValid = total === 100

  function handleChange(key: keyof Weights, value: number) {
    setWeights((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!isValid) return
    setSaving(true)
    setError(null)
    // Convert back to fractions for storage
    const fractional = {
      coverageRate: weights.coverageRate / 100,
      executionProgress: weights.executionProgress / 100,
      passRate: weights.passRate / 100,
      automationRate: weights.automationRate / 100,
      defectPressure: weights.defectPressure / 100,
    }
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, readinessWeights: fractional }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Save failed')
      }
      onSaved?.()
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {(Object.keys(weights) as (keyof Weights)[]).map((key) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">{WEIGHT_LABELS[key]}</label>
            <span className="text-sm font-semibold text-indigo-600 w-10 text-right">
              {weights[key]}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={weights[key]}
            onChange={(e) => handleChange(key, Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
      ))}

      <div
        className={`flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 ${
          isValid
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-700'
        }`}
      >
        <span>Total: {total}%</span>
        {!isValid && <span className="text-xs">(must equal 100%)</span>}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Button onClick={handleSave} disabled={saving || !isValid}>
        {saving ? 'Saving...' : 'Save Weights'}
      </Button>
    </div>
  )
}
