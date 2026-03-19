import { prisma } from '@/lib/prisma'
import { calculateCoverageRate } from './formulas/coverage-rate'
import { calculateExecutionProgress } from './formulas/execution-progress'
import { calculatePassRate } from './formulas/pass-rate'
import { calculateAutomationRate } from './formulas/automation-rate'
import { calculateDefectPressure } from './formulas/defect-pressure'
import { calculateReadinessScore } from './formulas/readiness-score'
import { persistKpiSnapshot } from './snapshot'

export async function calculateAndSnapshotKpis(projectId: string): Promise<string> {
  // Run all formulas in parallel where independent
  const [coverageResult, executionResult, passResult, automationResult, defectResult] =
    await Promise.all([
      calculateCoverageRate(projectId),
      calculateExecutionProgress(projectId),
      calculatePassRate(projectId),
      calculateAutomationRate(projectId),
      calculateDefectPressure(projectId),
    ])

  // Flaky stats — distinct flaky test cases (not execution count)
  const testCases = await prisma.testCase.findMany({
    where: { projectId },
    select: { id: true },
  })
  const tcIds = testCases.map(tc => tc.id)

  const flakyTestCases = await prisma.testExecution.findMany({
    where: { testCaseId: { in: tcIds }, isFlaky: true },
    select: { testCaseId: true },
    distinct: ['testCaseId'],
  })
  const flakyTestCount = flakyTestCases.length
  const flakyRate = tcIds.length === 0 ? 0 : flakyTestCount / tcIds.length

  // Readiness score
  const readiness = calculateReadinessScore({
    coverageRate: coverageResult.rate,
    executionProgress: executionResult.progress,
    passRate: passResult.rate,
    automationRate: automationResult.rate,
    defectPressure: defectResult.pressureScore,
  })

  // Persist snapshot
  const snapshotId = await persistKpiSnapshot(projectId, {
    coverageRate: coverageResult,
    executionProgress: executionResult,
    passRate: passResult,
    automation: automationResult,
    defectPressure: defectResult,
    flakyTestCount,
    flakyRate,
    readiness,
  })

  return snapshotId
}
