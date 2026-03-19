export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAutomationSummary, getAutomationGaps } from '@/server/queries/automation'
import { PageHeader } from '@/components/layout/page-header'
import { AutomationSummary } from '@/components/automation/automation-summary'
import { AutomationGapTable } from '@/components/automation/automation-gap-table'
import { AutomationDonut } from '@/components/charts/automation-donut'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'

export default async function AutomationPage() {
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
        <PageHeader title="Automation" />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No projects yet</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            Connect a Jira/Xray project to see automation data.
          </p>
        </div>
      </div>
    )
  }

  const project = projects[0]

  const [summary, gaps] = await Promise.all([
    getAutomationSummary(project.id),
    getAutomationGaps(project.id),
  ])

  return (
    <div>
      <PageHeader title="Automation" description={project.name} />

      {/* Top row: summary + donut */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Automation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <AutomationSummary
                total={summary.total}
                automated={summary.automated}
                manual={summary.manual}
                generic={summary.generic}
                automationRate={summary.automationRate}
              />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <AutomationDonut
              automated={summary.automated}
              manual={summary.manual}
              generic={summary.generic}
              automationRate={summary.automationRate}
            />
          </CardContent>
        </Card>
      </div>

      {/* Automation by label */}
      {summary.byLabel.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Automation Rate by Label</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.byLabel.map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-32 truncate shrink-0">
                    {row.label}
                  </span>
                  <div className="flex-1">
                    <ProgressBar value={row.rate * 100} showLabel />
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 w-20 text-right">
                    {row.automated}/{row.total}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automation gap table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Automation Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500 mb-3">
            Manual tests ordered by execution frequency — higher frequency means greater ROI from automating.
          </p>
          <AutomationGapTable items={gaps} />
        </CardContent>
      </Card>
    </div>
  )
}
