import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLatestKpiSnapshot, getKpiHistory } from '@/server/queries/kpi'
import { PageHeader } from '@/components/layout/page-header'
import { ReadinessScoreCard } from '@/components/dashboard/readiness-score-card'
import { KpiHealthCard } from '@/components/dashboard/kpi-health-card'
import { SyncStatusBanner } from '@/components/dashboard/sync-status-banner'
import { BlockersPanel } from '@/components/dashboard/blockers-panel'
import { TrendLine } from '@/components/charts/trend-line'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ReadinessTier } from '@/types/domain'

export const dynamic = 'force-dynamic'

// Helper to compute trend from KPI history for a given field
function computeTrend(
  history: Array<Record<string, number>>,
  field: string
): { trend: 'up' | 'down' | 'flat'; trendValue: number; historyValues: number[] } {
  const values = history.map((h) => h[field] as number).filter((v) => v != null)
  if (values.length < 2) {
    return { trend: 'flat', trendValue: 0, historyValues: values }
  }
  const delta = values[values.length - 1] - values[values.length - 2]
  const trend = Math.abs(delta) < 0.005 ? 'flat' : delta > 0 ? 'up' : 'down'
  return { trend, trendValue: delta, historyValues: values }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  // Fetch all projects
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // No projects yet
  if (projects.length === 0) {
    return (
      <div>
        <PageHeader title="Quality Dashboard" />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">No projects yet</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            Connect a Jira/Xray project to start tracking test quality and readiness.
          </p>
          <Link
            href="/settings"
            className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Get Started → Settings
          </Link>
        </div>
      </div>
    )
  }

  // Use first project
  const project = projects[0]

  // Fetch latest snapshot + history in parallel
  const [snapshot, history, latestSyncRun] = await Promise.all([
    getLatestKpiSnapshot(project.id),
    getKpiHistory(project.id, 30),
    prisma.syncRun.findFirst({
      where: { projectId: project.id },
      orderBy: { startedAt: 'desc' },
      select: { startedAt: true, status: true },
    }),
  ])

  // No snapshot yet
  if (!snapshot) {
    return (
      <div>
        <PageHeader
          title="Quality Dashboard"
          description={project.name}
        />
        <SyncStatusBanner
          projectId={project.id}
          lastSyncAt={latestSyncRun?.startedAt?.toISOString() ?? null}
          lastSyncStatus={latestSyncRun?.status ?? null}
        />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Sync required</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            No quality data yet for <strong>{project.name}</strong>.
            Run a sync to pull test coverage and execution data from Xray.
          </p>
        </div>
      </div>
    )
  }

  // Build trend data for chart
  const trendData = history.map((h) => ({
    date: h.snapshotAt.toISOString(),
    score: h.readinessScore,
    tier: h.readinessTier as string,
  }))

  // Compute KPI trends
  const historyRecords = history.map((h) => ({
    coverageRate: h.coverageRate,
    executionProgress: h.executionProgress,
    passRate: h.passRate,
    automationRate: h.automationRate,
    defectPressureScore: h.defectPressureScore,
  }))

  const coverageTrend = computeTrend(historyRecords, 'coverageRate')
  const executionTrend = computeTrend(historyRecords, 'executionProgress')
  const passTrend = computeTrend(historyRecords, 'passRate')
  const automationTrend = computeTrend(historyRecords, 'automationRate')
  const defectTrend = computeTrend(historyRecords, 'defectPressureScore')

  const snapshotTier = snapshot.readinessTier as ReadinessTier

  return (
    <div>
      <PageHeader
        title="Quality Dashboard"
        description={project.name}
      />

      {/* Sync status banner */}
      <SyncStatusBanner
        projectId={project.id}
        lastSyncAt={latestSyncRun?.startedAt?.toISOString() ?? null}
        lastSyncStatus={latestSyncRun?.status ?? null}
      />

      {/* Row 1: Readiness Score + KPI Health Cards */}
      <div className="flex gap-4 items-stretch">
        {/* Readiness Score Card */}
        <div className="w-64 shrink-0">
          <ReadinessScoreCard
            score={snapshot.readinessScore}
            tier={snapshotTier}
            contributions={{
              coverageRate: snapshot.coverageRate,
              executionProgress: snapshot.executionProgress,
              passRate: snapshot.passRate,
              automationRate: snapshot.automationRate,
              defectPressure: snapshot.defectPressureScore,
            }}
            snapshotAt={snapshot.snapshotAt.toISOString()}
          />
        </div>

        {/* 5 KPI Health Cards */}
        <div className="flex flex-1 gap-3 min-w-0">
          <KpiHealthCard
            title="Coverage Rate"
            value={snapshot.coverageRate}
            trend={coverageTrend.trend}
            trendValue={coverageTrend.trendValue}
            history={coverageTrend.historyValues}
            thresholds={{ green: 0.80, amber: 0.60 }}
            description={`${snapshot.coveredRequirements}/${snapshot.totalRequirements} req`}
          />
          <KpiHealthCard
            title="Execution Progress"
            value={snapshot.executionProgress}
            trend={executionTrend.trend}
            trendValue={executionTrend.trendValue}
            history={executionTrend.historyValues}
            thresholds={{ green: 0.75, amber: 0.50 }}
            description={`${snapshot.totalExecuted}/${snapshot.totalPlanned} tests`}
          />
          <KpiHealthCard
            title="Pass Rate"
            value={snapshot.passRate}
            trend={passTrend.trend}
            trendValue={passTrend.trendValue}
            history={passTrend.historyValues}
            thresholds={{ green: 0.90, amber: 0.75 }}
            description={`${snapshot.totalPassed}/${snapshot.totalExecuted} passed`}
          />
          <KpiHealthCard
            title="Automation Rate"
            value={snapshot.automationRate}
            trend={automationTrend.trend}
            trendValue={automationTrend.trendValue}
            history={automationTrend.historyValues}
            thresholds={{ green: 0.70, amber: 0.40 }}
            description={`${snapshot.automatedTests}/${snapshot.totalTests} tests`}
          />
          <KpiHealthCard
            title="Defect Pressure"
            value={snapshot.defectPressureScore}
            trend={defectTrend.trend === 'up' ? 'down' : defectTrend.trend === 'down' ? 'up' : 'flat'}
            trendValue={defectTrend.trendValue}
            history={defectTrend.historyValues}
            thresholds={{ green: 0.30, amber: 0.60 }}
            description={`${snapshot.openCritical} critical open`}
          />
        </div>
      </div>

      {/* Row 2: Trend Chart + Blockers Panel */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {/* Trend Chart — 2/3 width */}
        <div className="col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>30-Day Readiness Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {trendData.length > 1 ? (
                <TrendLine data={trendData} height={220} />
              ) : (
                <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">
                  Not enough history to show trend. Sync more data points.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Blockers Panel — 1/3 width */}
        <div className="col-span-1">
          <BlockersPanel
            snapshot={{
              openCritical: snapshot.openCritical,
              totalRequirements: snapshot.totalRequirements,
              coveredRequirements: snapshot.coveredRequirements,
              coverageRate: snapshot.coverageRate,
              passRate: snapshot.passRate,
              totalExecuted: snapshot.totalExecuted,
              totalPassed: snapshot.totalPassed,
              flakyTestCount: snapshot.flakyTestCount,
            }}
          />
        </div>
      </div>
    </div>
  )
}
