export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTestPlans, getExecutionSummary, getExecutionResults } from '@/server/queries/execution'
import { PageHeader } from '@/components/layout/page-header'
import { ExecutionSummary } from '@/components/execution/execution-summary'
import { ExecutionResultsTable } from '@/components/execution/execution-results-table'
import { PassFailPie } from '@/components/charts/pass-fail-pie'
import { TestPlanSelector } from '@/components/execution/test-plan-selector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface PageProps {
  searchParams: Promise<{ planId?: string }>
}

export default async function ExecutionPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  const { planId } = await searchParams

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  if (projects.length === 0) {
    return (
      <div>
        <PageHeader title="Test Execution" />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No projects yet</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">Connect a Jira/Xray project to see execution data.</p>
        </div>
      </div>
    )
  }

  const project = projects[0]

  const [plans, summary, results] = await Promise.all([
    getTestPlans(project.id),
    getExecutionSummary(project.id, planId),
    getExecutionResults(project.id, planId, { limit: 50 }),
  ])

  if (plans.length === 0 || summary.total === 0) {
    return (
      <div>
        <PageHeader title="Test Execution" description={project.name} />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No execution data</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            Run a sync to pull test execution data from Xray.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Test Execution"
        description={project.name}
        actions={
          <Suspense fallback={<Skeleton className="h-9 w-56" />}>
            <TestPlanSelector plans={plans} selectedPlanId={planId} />
          </Suspense>
        }
      />

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          <ExecutionSummary
            planName={summary.planName}
            total={summary.total}
            executed={summary.executed}
            passed={summary.passed}
            failed={summary.failed}
            blocked={summary.blocked}
            todo={summary.todo}
            progress={summary.progress}
            passRate={summary.passRate}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Pass / Fail Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <PassFailPie
              passed={summary.passed}
              failed={summary.failed}
              blocked={summary.blocked}
              todo={summary.todo}
              passRate={summary.passRate}
            />
          </CardContent>
        </Card>
      </div>

      {/* Results table */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ExecutionResultsTable
            items={results.items}
            total={results.total}
          />
        </CardContent>
      </Card>
    </div>
  )
}
