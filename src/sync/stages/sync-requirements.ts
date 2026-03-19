import { prisma } from '@/lib/prisma'
import { normalizeRequirement } from '../normalizer'
import { StageResult, SyncContext } from '../types'

export async function syncRequirementsStage(ctx: SyncContext): Promise<StageResult> {
  try {
    const raw = await ctx.adapter.fetchRequirements({
      projectKey: ctx.projectKey,
      since: ctx.since,
    })

    const syncedAt = new Date()
    let synced = 0

    for (const item of raw) {
      const data = normalizeRequirement(item, ctx.projectId, syncedAt)
      await prisma.requirement.upsert({
        where: {
          externalId_projectId: {
            externalId: data.externalId,
            projectId: ctx.projectId,
          },
        },
        create: data,
        update: {
          title: data.title,
          type: data.type,
          status: data.status,
          priority: data.priority,
          epicKey: data.epicKey,
          assignee: data.assignee,
          labels: data.labels,
          components: data.components,
          description: data.description,
          syncedAt: data.syncedAt,
        },
      })
      synced++
    }

    return { stage: 'requirements', itemsSynced: synced, status: 'done' }
  } catch (error) {
    return { stage: 'requirements', itemsSynced: 0, status: 'error', error: String(error) }
  }
}
