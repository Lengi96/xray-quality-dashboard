import { prisma } from '@/lib/prisma'
import { normalizeTestCase } from '../normalizer'
import { StageResult, SyncContext } from '../types'

export async function syncTestCasesStage(ctx: SyncContext): Promise<StageResult> {
  try {
    const raw = await ctx.adapter.fetchTestCases({
      projectKey: ctx.projectKey,
      since: ctx.since,
    })

    const syncedAt = new Date()
    let synced = 0

    for (const item of raw) {
      const data = normalizeTestCase(item, ctx.projectId, syncedAt)
      await prisma.testCase.upsert({
        where: {
          externalId_projectId: {
            externalId: data.externalId,
            projectId: ctx.projectId,
          },
        },
        create: data,
        update: {
          title: data.title,
          testType: data.testType,
          status: data.status,
          priority: data.priority,
          labels: data.labels,
          components: data.components,
          preconditions: data.preconditions,
          definition: data.definition,
          automationDefId: data.automationDefId,
          syncedAt: data.syncedAt,
        },
      })
      synced++
    }

    return { stage: 'test-cases', itemsSynced: synced, status: 'done' }
  } catch (error) {
    return { stage: 'test-cases', itemsSynced: 0, status: 'error', error: String(error) }
  }
}
