import { prisma } from '@/lib/prisma'

export async function getTestPlans(projectId: string) {
  return prisma.testPlan.findMany({
    where: { projectId },
    orderBy: { startDate: 'desc' },
  })
}

export async function getExecutionSummary(projectId: string, testPlanId?: string) {
  let planId = testPlanId
  if (!planId) {
    const latestPlan = await prisma.testPlan.findFirst({
      where: { projectId },
      orderBy: { startDate: 'desc' },
    })
    planId = latestPlan?.id
  }

  if (!planId) {
    return {
      total: 0,
      executed: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      todo: 0,
      progress: 0,
      passRate: 0,
      planName: null,
      planId: null,
    }
  }

  const counts = await prisma.testExecution.groupBy({
    by: ['status'],
    where: { testPlanId: planId },
    _count: true,
  })

  const byStatus: Record<string, number> = {}
  for (const row of counts) {
    byStatus[row.status] = row._count
  }

  const total = Object.values(byStatus).reduce((s, v) => s + v, 0)
  const executed = total - (byStatus['TODO'] ?? 0) - (byStatus['EXECUTING'] ?? 0)
  const passed = byStatus['PASS'] ?? 0
  const plan = await prisma.testPlan.findUnique({ where: { id: planId } })

  return {
    planId,
    planName: plan?.name ?? null,
    total,
    executed,
    passed,
    failed: byStatus['FAIL'] ?? 0,
    blocked: byStatus['BLOCKED'] ?? 0,
    todo: byStatus['TODO'] ?? 0,
    progress: total === 0 ? 0 : executed / total,
    passRate: executed === 0 ? 0 : passed / executed,
  }
}

export async function getExecutionResults(
  projectId: string,
  testPlanId?: string,
  options?: { status?: string; limit?: number; offset?: number }
) {
  let planId = testPlanId
  if (!planId) {
    const latest = await prisma.testPlan.findFirst({
      where: { projectId },
      orderBy: { startDate: 'desc' },
    })
    planId = latest?.id
  }

  const where = {
    ...(planId ? { testPlanId: planId } : {}),
    ...(options?.status ? { status: options.status as 'PASS' | 'FAIL' | 'TODO' | 'EXECUTING' | 'BLOCKED' } : {}),
    testCase: { projectId },
  }

  const [items, total] = await Promise.all([
    prisma.testExecution.findMany({
      where,
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
      orderBy: { executedAt: 'desc' },
      include: {
        testCase: {
          select: { externalId: true, title: true, testType: true, labels: true },
        },
      },
    }),
    prisma.testExecution.count({ where }),
  ])
  return { items, total }
}
