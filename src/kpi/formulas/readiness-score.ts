import { DEFAULT_KPI_WEIGHTS, READINESS_THRESHOLDS } from '@/lib/constants'

export type ReadinessTier = 'GREEN' | 'AMBER' | 'RED'

export interface ReadinessScoreInput {
  coverageRate: number
  executionProgress: number
  passRate: number
  automationRate: number
  defectPressure: number // already inverted (higher = better)
}

export interface ReadinessScoreResult {
  score: number // 0-100
  tier: ReadinessTier
  contributions: Record<string, number> // per-KPI weighted contribution
}

export function calculateReadinessScore(
  kpis: ReadinessScoreInput,
  weights = DEFAULT_KPI_WEIGHTS
): ReadinessScoreResult {
  const contributions = {
    coverageRate: kpis.coverageRate * weights.coverageRate,
    executionProgress: kpis.executionProgress * weights.executionProgress,
    passRate: kpis.passRate * weights.passRate,
    automationRate: kpis.automationRate * weights.automationRate,
    defectPressure: kpis.defectPressure * weights.defectPressure,
  }

  const raw = Object.values(contributions).reduce((sum, v) => sum + v, 0)
  const score = Math.round(raw * 1000) / 10 // round to 1 decimal, scale to 0-100

  const tier: ReadinessTier =
    score >= READINESS_THRESHOLDS.GREEN
      ? 'GREEN'
      : score >= READINESS_THRESHOLDS.AMBER
        ? 'AMBER'
        : 'RED'

  return { score, tier, contributions }
}
