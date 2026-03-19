import { prisma } from '@/lib/prisma'
import { normalizeTestExecution } from '../normalizer'
import { StageResult, SyncContext } from '../types'

async function detectFlakiness(testCaseId: string) {
  const recent = await prisma.testExecution.findMany({
    where: { testCaseId },
    orderBy: { executedAt: 'desc' },
    take: 10,
    select: { status: true },
  })
  if (recent.length < 3) return { isFlaky: false, score: 0 }
  const transitions = recent.reduce((count, curr, i) => {
    if (i === 0) return count
    return curr.status !== recent[i - 1].status ? count + 1 : count
  }, 0)
  const score = transitions / (recent.length - 1)
  return { isFlaky: score > 0.4, score }
}

export async function syncExecutionsStage(ctx: SyncContext): Promise<StageResult> {
  try {
    const raw = await ctx.adapter.fetchTestExecutions({
      projectKey: ctx.projectKey,
      since: ctx.since,
    })

    // Build batch lookup maps (avoid N+1)
    const testCases = await prisma.testCase.findMany({
      where: { projectId: ctx.projectId },
      select: { id: true, externalId: true },
    })
    const testPlans = await prisma.testPlan.findMany({
      where: { projectId: ctx.projectId },
      select: { id: true, externalId: true },
    })
    const tcMap = new Map(testCases.map(tc => [tc.externalId, tc.id]))
    const tpMap = new Map(testPlans.map(tp => [tp.externalId, tp.id]))

    const syncedAt = new Date()
    let synced = 0

    // Track which test case IDs had executions upserted for flakiness check
    const affectedTestCaseIds = new Set<string>()

    for (const item of raw) {
      const testCaseId = tcMap.get(item.testCaseKey)
      if (!testCaseId) continue

      const testPlanId = item.testPlanKey ? (tpMap.get(item.testPlanKey) ?? null) : null

      const data = normalizeTestExecution(item, ctx.projectId, testCaseId, testPlanId, syncedAt)

      await prisma.testExecution.upsert({
        where: {
          externalId_projectId: {
            externalId: data.externalId,
            projectId: ctx.projectId,
          },
        },
        create: data,
        update: {
          status: data.status,
          executedAt: data.executedAt,
          duration: data.duration,
          environment: data.environment,
          executedBy: data.executedBy,
          comment: data.comment,
          testPlanId: data.testPlanId,
          syncedAt: data.syncedAt,
        },
      })

      affectedTestCaseIds.add(testCaseId)
      synced++
    }

    // Run flakiness detection for affected test cases
    for (const testCaseId of affectedTestCaseIds) {
      const { isFlaky, score } = await detectFlakiness(testCaseId)
      await prisma.testExecution.updateMany({
        where: { testCaseId },
        data: { isFlaky, flakyScore: score },
      })
    }

    return { stage: 'executions', itemsSynced: synced, status: 'done' }
  } catch (error) {
    return { stage: 'executions', itemsSynced: 0, status: 'error', error: String(error) }
  }
}
