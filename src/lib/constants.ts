export const SEVERITY_WEIGHTS = {
  CRITICAL: 10,
  HIGH: 5,
  MEDIUM: 2,
  LOW: 1,
  TRIVIAL: 0.5,
} as const

export const DEFAULT_KPI_WEIGHTS = {
  coverageRate: 0.25,
  executionProgress: 0.20,
  passRate: 0.25,
  automationRate: 0.10,
  defectPressure: 0.20,
} as const

export const READINESS_THRESHOLDS = {
  GREEN: 75,
  AMBER: 50,
} as const

export const DEFECT_PRESSURE_NORMALIZER = 500  // CRITICAL × 50 baseline

export const FLAKY_DETECTION_WINDOW = 10  // last N executions to check
export const FLAKY_SCORE_THRESHOLD = 0.4  // >40% transition rate = flaky
