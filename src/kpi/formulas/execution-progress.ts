import { prisma } from '@/lib/prisma'

export interface ExecutionProgressResult {
  totalPlanned: number
  totalExecuted: number
  progress: number // 0.0-1.0
  testPlanId?: string
  testPlanName?: string
}

export async function calculateExecutionProgress(projectId: string): Promise<ExecutionProgressResult> {
  // Get the most recent test plan for this project
  const latestPlan = await prisma.testPlan.findFirst({
    where: { projectId },
    orderBy: { startDate: 'desc' },
  })

  if (!latestPlan) {
    return { totalPlanned: 0, totalExecuted: 0, progress: 0 }
  }

  const total = await prisma.testExecution.count({ where: { testPlanId: latestPlan.id } })
  const executed = await prisma.testExecution.count({
    where: { testPlanId: latestPlan.id, status: { notIn: ['TODO', 'EXECUTING'] } },
  })

  return {
    totalPlanned: total,
    totalExecuted: executed,
    progress: total === 0 ? 0 : executed / total,
    testPlanId: latestPlan.id,
    testPlanName: latestPlan.name,
  }
}
