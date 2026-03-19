export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCoverageSummary, getUncoveredRequirements } from '@/server/queries/coverage'
import { PageHeader } from '@/components/layout/page-header'
import { CoverageSummary } from '@/components/coverage/coverage-summary'
import { UncoveredRequirementsTable } from '@/components/coverage/uncovered-requirements-table'
import { CoverageDonut } from '@/components/charts/coverage-donut'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function CoveragePage() {
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
        <PageHeader title="Test Coverage" />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No projects yet</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">Connect a Jira/Xray project to see coverage data.</p>
        </div>
      </div>
    )
  }

  const project = projects[0]

  const [summary, uncovered] = await Promise.all([
    getCoverageSummary(project.id),
    getUncoveredRequirements(project.id, { limit: 50 }),
  ])

  return (
    <div>
      <PageHeader
        title="Test Coverage"
        description={project.name}
      />

      {/* Top row: donut + summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Coverage Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <CoverageDonut
              covered={summary.covered}
              uncovered={summary.uncovered}
              rate={summary.rate}
            />
          </CardContent>
        </Card>
        <div className="col-span-2">
          <CoverageSummary
            total={summary.total}
            covered={summary.covered}
            uncovered={summary.uncovered}
            rate={summary.rate}
            byType={summary.byType}
          />
        </div>
      </div>

      {/* Uncovered requirements table */}
      <Card>
        <CardHeader>
          <CardTitle>Uncovered Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <UncoveredRequirementsTable
            items={uncovered.items}
            total={uncovered.total}
          />
        </CardContent>
      </Card>
    </div>
  )
}
