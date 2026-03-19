import { prisma } from '@/lib/prisma'

export interface PassRateResult {
  totalExecuted: number
  totalPassed: number
  rate: number // 0.0-1.0
}

export async function calculatePassRate(projectId: string): Promise<PassRateResult> {
  // Get all test case IDs for this project, then their executions
  const testCases = await prisma.testCase.findMany({
    where: { projectId },
    select: { id: true },
  })
  const testCaseIds = testCases.map(tc => tc.id)

  const executed = await prisma.testExecution.count({
    where: { testCaseId: { in: testCaseIds }, status: { notIn: ['TODO', 'EXECUTING'] } },
  })
  const passed = await prisma.testExecution.count({
    where: { testCaseId: { in: testCaseIds }, status: 'PASS' },
  })

  return {
    totalExecuted: executed,
    totalPassed: passed,
    rate: executed === 0 ? 0 : passed / executed,
  }
}
