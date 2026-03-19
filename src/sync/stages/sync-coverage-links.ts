import { prisma } from '@/lib/prisma'
import { StageResult, SyncContext } from '../types'

export async function syncCoverageLinksStage(ctx: SyncContext): Promise<StageResult> {
  try {
    const raw = await ctx.adapter.fetchCoverageLinks({ projectKey: ctx.projectKey })

    // Build lookup maps in batch (avoid N+1)
    const reqs = await prisma.requirement.findMany({
      where: { projectId: ctx.projectId },
      select: { id: true, externalId: true },
    })
    const testCases = await prisma.testCase.findMany({
      where: { projectId: ctx.projectId },
      select: { id: true, externalId: true },
    })
    const reqMap = new Map(reqs.map(r => [r.externalId, r.id]))
    const tcMap = new Map(testCases.map(tc => [tc.externalId, tc.id]))

    let synced = 0
    for (const link of raw) {
      const requirementId = reqMap.get(link.requirementKey)
      const testCaseId = tcMap.get(link.testCaseKey)
      if (!requirementId || !testCaseId) continue

      await prisma.coverageLink.upsert({
        where: { requirementId_testCaseId: { requirementId, testCaseId } },
        create: { requirementId, testCaseId, linkType: link.linkType },
        update: { linkType: link.linkType },
      })
      synced++
    }
    return { stage: 'coverage-links', itemsSynced: synced, status: 'done' }
  } catch (error) {
    return { stage: 'coverage-links', itemsSynced: 0, status: 'error', error: String(error) }
  }
}
