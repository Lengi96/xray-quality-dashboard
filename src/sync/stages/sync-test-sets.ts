import { prisma } from '@/lib/prisma'
import { normalizeTestSet } from '../normalizer'
import { StageResult, SyncContext } from '../types'

export async function syncTestSetsStage(ctx: SyncContext): Promise<StageResult> {
  try {
    const raw = await ctx.adapter.fetchTestSets({
      projectKey: ctx.projectKey,
      since: ctx.since,
    })

    const syncedAt = new Date()
    let synced = 0

    for (const item of raw) {
      const setData = normalizeTestSet(item, ctx.projectId, syncedAt)

      const testSet = await prisma.testSet.upsert({
        where: {
          externalId_projectId: {
            externalId: setData.externalId,
            projectId: ctx.projectId,
          },
        },
        create: setData,
        update: {
          name: setData.name,
          syncedAt: setData.syncedAt,
        },
      })

      // Sync test set members — batch lookup test cases
      if (item.testCaseKeys.length > 0) {
        const testCases = await prisma.testCase.findMany({
          where: {
            projectId: ctx.projectId,
            externalId: { in: item.testCaseKeys },
          },
          select: { id: true, externalId: true },
        })
        const tcMap = new Map(testCases.map(tc => [tc.externalId, tc.id]))

        for (const key of item.testCaseKeys) {
          const testCaseId = tcMap.get(key)
          if (!testCaseId) continue
          await prisma.testSetMember.upsert({
            where: {
              testSetId_testCaseId: {
                testSetId: testSet.id,
                testCaseId,
              },
            },
            create: { testSetId: testSet.id, testCaseId },
            update: {},
          })
        }
      }

      synced++
    }

    return { stage: 'test-sets', itemsSynced: synced, status: 'done' }
  } catch (error) {
    return { stage: 'test-sets', itemsSynced: 0, status: 'error', error: String(error) }
  }
}
