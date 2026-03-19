import { prisma } from '@/lib/prisma'
import { createAdapter, getAdapterConfig } from '@/integrations/factory'
import { SyncContext, StageResult } from './types'
import { calculateAndSnapshotKpis } from '@/kpi/engine'
import { syncProjectsStage } from './stages/sync-projects'
import { syncRequirementsStage } from './stages/sync-requirements'
import { syncTestCasesStage } from './stages/sync-test-cases'
import { syncTestPlansStage } from './stages/sync-test-plans'
import { syncTestSetsStage } from './stages/sync-test-sets'
import { syncCoverageLinksStage } from './stages/sync-coverage-links'
import { syncExecutionsStage } from './stages/sync-executions'
import { syncDefectsStage } from './stages/sync-defects'

type StageFunction = (ctx: SyncContext) => Promise<StageResult>

const STAGES: StageFunction[] = [
  syncProjectsStage,
  syncRequirementsStage,
  syncTestCasesStage,
  syncTestPlansStage,
  syncTestSetsStage,
  syncCoverageLinksStage,
  syncExecutionsStage,
  syncDefectsStage,
]

export async function runSync(projectId: string, isIncremental = false): Promise<string> {
  // 1. Load project + config from DB
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { config: true },
  })

  if (!project) {
    throw new Error(`Project not found: ${projectId}`)
  }

  // 2. Create SyncRun record with status RUNNING
  const syncRun = await prisma.syncRun.create({
    data: {
      projectId,
      status: 'RUNNING',
      isIncremental,
      stages: {},
    },
  })

  const syncRunId = syncRun.id

  try {
    // 3. Determine `since` if incremental
    let since: Date | undefined
    if (isIncremental) {
      const lastSuccess = await prisma.syncRun.findFirst({
        where: { projectId, status: 'SUCCESS' },
        orderBy: { completedAt: 'desc' },
        select: { completedAt: true },
      })
      since = lastSuccess?.completedAt ?? undefined
    }

    // 4. Create adapter via factory
    const adapterConfig = project.config
      ? getAdapterConfig(project.config)
      : { mode: 'mock' as const }

    const adapter = await createAdapter(adapterConfig)

    // 5. Run each stage in sequence
    const ctx: SyncContext = {
      syncRunId,
      projectId,
      projectKey: project.externalId,
      adapter,
      since,
    }

    const stageStatuses: Record<string, 'done' | 'error' | 'skipped'> = {}
    const stageResults: StageResult[] = []
    let totalItemsSynced = 0
    let hasErrors = false

    for (const stageFn of STAGES) {
      const result = await stageFn(ctx)
      stageStatuses[result.stage] = result.status
      stageResults.push(result)
      totalItemsSynced += result.itemsSynced
      if (result.status === 'error') {
        hasErrors = true
      }
    }

    // Determine final status
    const allFailed = stageResults.every(r => r.status === 'error')
    const finalStatus = allFailed ? 'FAILED' : hasErrors ? 'PARTIAL' : 'SUCCESS'

    // 6. Update SyncRun to SUCCESS/PARTIAL/FAILED
    await prisma.syncRun.update({
      where: { id: syncRunId },
      data: {
        status: finalStatus,
        completedAt: new Date(),
        stages: stageStatuses,
        itemsSynced: totalItemsSynced,
      },
    })

    // After all stages: compute and persist KPI snapshot (non-fatal)
    try {
      await calculateAndSnapshotKpis(projectId)
    } catch (kpiError) {
      console.error('KPI calculation failed:', kpiError)
    }

    return syncRunId
  } catch (error) {
    // Fatal pipeline error — update the SyncRun to FAILED
    await prisma.syncRun.update({
      where: { id: syncRunId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errorMessage: String(error),
      },
    })
    throw error
  }
}
