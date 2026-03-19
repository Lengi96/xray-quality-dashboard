export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDefectSummary, getDefectList } from '@/server/queries/defects'
import { PageHeader } from '@/components/layout/page-header'
import { DefectSeverityBar } from '@/components/charts/defect-severity-bar'
import { DefectBreakdownTable } from '@/components/defects/defect-breakdown-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DefectsPage() {
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
        <PageHeader title="Defects" />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No projects yet</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            Connect a Jira/Xray project to see defect data.
          </p>
        </div>
      </div>
    )
  }

  const project = projects[0]

  const [summary, defects] = await Promise.all([
    getDefectSummary(project.id),
    getDefectList(project.id, { status: 'open', limit: 100 }),
  ])

  const avgAge =
    defects.items.length > 0
      ? Math.round(
          defects.items.reduce(
            (sum, d) =>
              sum +
              Math.floor(
                (Date.now() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24)
              ),
            0
          ) / defects.items.length
        )
      : 0

  return (
    <div>
      <PageHeader title="Defects" description={project.name} />

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-gray-900">{summary.totalOpen}</div>
            <div className="text-sm text-gray-500 mt-1">Total Open</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">
              {summary.bySeverity['CRITICAL'] ?? 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Critical</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-orange-500">
              {summary.bySeverity['HIGH'] ?? 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">High</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-gray-700">{avgAge}d</div>
            <div className="text-sm text-gray-500 mt-1">Avg Age (open)</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Age distribution */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Open Defects by Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <DefectSeverityBar bySeverity={summary.bySeverity} />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="py-2 text-gray-600">Older than 7 days</td>
                  <td className="py-2 text-right font-semibold text-gray-900">
                    {summary.ageDistribution.older7}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Older than 30 days</td>
                  <td className="py-2 text-right font-semibold text-amber-600">
                    {summary.ageDistribution.older30}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Older than 90 days</td>
                  <td className="py-2 text-right font-semibold text-red-600">
                    {summary.ageDistribution.older90}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Defect table */}
      <Card>
        <CardHeader>
          <CardTitle>Defect Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <DefectBreakdownTable items={defects.items} total={defects.total} />
        </CardContent>
      </Card>
    </div>
  )
}
