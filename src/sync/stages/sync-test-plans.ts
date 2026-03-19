import { prisma } from '@/lib/prisma'
import { normalizeTestPlan } from '../normalizer'
import { StageResult, SyncContext } from '../types'

export async function syncTestPlansStage(ctx: SyncContext): Promise<StageResult> {
  try {
    const raw = await ctx.adapter.fetchTestPlans({
      projectKey: ctx.projectKey,
      since: ctx.since,
    })

    const syncedAt = new Date()
    let synced = 0

    for (const item of raw) {
      const data = normalizeTestPlan(item, ctx.projectId, syncedAt)
      await prisma.testPlan.upsert({
        where: {
          externalId_projectId: {
            externalId: data.externalId,
            projectId: ctx.projectId,
          },
        },
        create: data,
        update: {
          name: data.name,
          status: data.status,
          version: data.version,
          startDate: data.startDate,
          endDate: data.endDate,
          syncedAt: data.syncedAt,
        },
      })
      synced++
    }

    return { stage: 'test-plans', itemsSynced: synced, status: 'done' }
  } catch (error) {
    return { stage: 'test-plans', itemsSynced: 0, status: 'error', error: String(error) }
  }
}
