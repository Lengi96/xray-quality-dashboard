import { prisma } from '@/lib/prisma'
import { DEFAULT_KPI_WEIGHTS } from '@/lib/constants'
import { CoverageRateResult } from './formulas/coverage-rate'
import { ExecutionProgressResult } from './formulas/execution-progress'
import { PassRateResult } from './formulas/pass-rate'
import { AutomationRateResult } from './formulas/automation-rate'
import { DefectPressureResult } from './formulas/defect-pressure'
import { ReadinessScoreResult } from './formulas/readiness-score'

export interface KpiValues {
  coverageRate: CoverageRateResult
  executionProgress: ExecutionProgressResult
  passRate: PassRateResult
  automation: AutomationRateResult
  defectPressure: DefectPressureResult
  flakyTestCount: number
  flakyRate: number
  readiness: ReadinessScoreResult
}

export async function persistKpiSnapshot(projectId: string, kpis: KpiValues): Promise<string> {
  const snapshot = await prisma.kpiSnapshot.create({
    data: {
      projectId,
      totalRequirements: kpis.coverageRate.totalRequirements,
      coveredRequirements: kpis.coverageRate.coveredRequirements,
      coverageRate: kpis.coverageRate.rate,
      totalPlanned: kpis.executionProgress.totalPlanned,
      totalExecuted: kpis.executionProgress.totalExecuted,
      executionProgress: kpis.executionProgress.progress,
      totalPassed: kpis.passRate.totalPassed,
      passRate: kpis.passRate.rate,
      totalTests: kpis.automation.totalTests,
      automatedTests: kpis.automation.automatedTests,
      automationRate: kpis.automation.rate,
      openCritical: kpis.defectPressure.openCritical,
      openHigh: kpis.defectPressure.openHigh,
      openMedium: kpis.defectPressure.openMedium,
      openLow: kpis.defectPressure.openLow,
      openTrivial: kpis.defectPressure.openTrivial,
      defectPressureScore: kpis.defectPressure.pressureScore,
      flakyTestCount: kpis.flakyTestCount,
      flakyRate: kpis.flakyRate,
      readinessScore: kpis.readiness.score,
      readinessTier: kpis.readiness.tier,
      weightsSnapshot: DEFAULT_KPI_WEIGHTS,
    },
  })
  return snapshot.id
}
