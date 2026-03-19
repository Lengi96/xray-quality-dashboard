import { prisma } from '@/lib/prisma'
import { normalizeDefect } from '../normalizer'
import { StageResult, SyncContext } from '../types'

export async function syncDefectsStage(ctx: SyncContext): Promise<StageResult> {
  try {
    const raw = await ctx.adapter.fetchDefects({
      projectKey: ctx.projectKey,
      since: ctx.since,
    })

    const syncedAt = new Date()
    let synced = 0

    for (const item of raw) {
      const data = normalizeDefect(item, ctx.projectId, syncedAt)
      await prisma.defect.upsert({
        where: {
          externalId_projectId: {
            externalId: data.externalId,
            projectId: ctx.projectId,
          },
        },
        create: data,
        update: {
          title: data.title,
          status: data.status,
          severity: data.severity,
          priority: data.priority,
          assignee: data.assignee,
          linkedTestKey: data.linkedTestKey,
          components: data.components,
          labels: data.labels,
          resolvedAt: data.resolvedAt,
          syncedAt: data.syncedAt,
        },
      })
      synced++
    }

    return { stage: 'defects', itemsSynced: synced, status: 'done' }
  } catch (error) {
    return { stage: 'defects', itemsSynced: 0, status: 'error', error: String(error) }
  }
}
