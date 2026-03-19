export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLatestKpiSnapshot } from '@/server/queries/kpi'
import { getRiskHotspots, getFlakyTests, getReleaseBlockers } from '@/server/queries/risk'
import { PageHeader } from '@/components/layout/page-header'
import { RiskHotspotTable } from '@/components/risk/risk-hotspot-table'
import { FlakyTestList } from '@/components/risk/flaky-test-list'
import { BlockersList } from '@/components/risk/blockers-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function tierVariant(tier: string): 'success' | 'warning' | 'danger' {
  if (tier === 'GREEN') return 'success'
  if (tier === 'AMBER') return 'warning'
  return 'danger'
}

export default async function RiskPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  if (projects.length === 0) {
    return (
      <div>
        <PageHeader title="Risk" />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No projects yet</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            Connect a Jira/Xray project to see risk data.
          </p>
        </div>
      </div>
    )
  }

  const project = projects[0]

  const [kpi, hotspots, flakyTests, blockers] = await Promise.all([
    getLatestKpiSnapshot(project.id),
    getRiskHotspots(project.id),
    getFlakyTests(project.id),
    getReleaseBlockers(project.id),
  ])

  return (
    <div>
      <PageHeader title="Risk" description={project.name} />

      {/* Release Readiness */}
      {kpi && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-5xl font-bold text-gray-900">
                  {kpi.readinessScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500 mt-1">Release Readiness Score</div>
              </div>
              <Badge variant={tierVariant(kpi.readinessTier)} className="text-sm px-3 py-1">
                {kpi.readinessTier}
              </Badge>
              <div className="ml-auto grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-800">
                    {(kpi.coverageRate * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">Coverage</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-800">
                    {(kpi.passRate * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">Pass Rate</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-800">
                    {kpi.openCritical + kpi.openHigh}
                  </div>
                  <div className="text-xs text-gray-400">Crit + High</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blockers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Release Blockers</CardTitle>
        </CardHeader>
        <CardContent>
          <BlockersList
            criticalDefects={blockers.criticalDefects}
            failedOnCritical={blockers.failedOnCritical}
          />
        </CardContent>
      </Card>

      {/* Risk hotspots + flaky tests */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Uncovered Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskHotspotTable items={hotspots.uncoveredRequirements} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Flaky Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <FlakyTestList items={flakyTests} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
