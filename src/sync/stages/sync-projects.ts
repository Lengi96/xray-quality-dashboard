import { prisma } from '@/lib/prisma'
import { StageResult, SyncContext } from '../types'

export async function syncProjectsStage(ctx: SyncContext): Promise<StageResult> {
  try {
    const raw = await ctx.adapter.fetchProjects()

    for (const project of raw) {
      await prisma.project.upsert({
        where: { externalId: project.externalId },
        create: {
          externalId: project.externalId,
          name: project.name,
          platform: 'JIRA_CLOUD',
          description: project.description ?? null,
        },
        update: {
          name: project.name,
          description: project.description ?? null,
        },
      })
    }

    return { stage: 'projects', itemsSynced: raw.length, status: 'done' }
  } catch (error) {
    return { stage: 'projects', itemsSynced: 0, status: 'error', error: String(error) }
  }
}
