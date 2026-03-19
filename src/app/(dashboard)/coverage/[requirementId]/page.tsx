export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { getRequirementDetail } from '@/server/queries/coverage'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

type BadgeVariant = 'success' | 'danger' | 'warning' | 'default' | 'info' | 'secondary'

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  PASS: 'success',
  FAIL: 'danger',
  BLOCKED: 'warning',
  TODO: 'default',
  EXECUTING: 'info',
  ABORTED: 'secondary',
}

const STATUS_LABELS: Record<string, string> = {
  PASS: 'Pass',
  FAIL: 'Fail',
  BLOCKED: 'Blocked',
  TODO: 'Todo',
  EXECUTING: 'Executing',
  ABORTED: 'Aborted',
}

interface PageProps {
  params: Promise<{ requirementId: string }>
}

export default async function RequirementDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  const { requirementId } = await params
  const requirement = await getRequirementDetail(requirementId)

  if (!requirement) {
    notFound()
  }

  return (
    <div>
      <PageHeader
        title={requirement.title}
        description={requirement.externalId}
        breadcrumbs={[
          { label: 'Coverage', href: '/coverage' },
          { label: requirement.externalId },
        ]}
        actions={
          <Link href="/coverage">
            <Button variant="outline" size="sm">Back to Coverage</Button>
          </Link>
        }
      />

      {/* Requirement metadata */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Requirement Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Key</dt>
              <dd className="mt-1 text-sm font-mono text-gray-900">{requirement.externalId}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</dt>
              <dd className="mt-1">
                <Badge variant="info">{requirement.type}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{requirement.status}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</dt>
              <dd className="mt-1 text-sm text-gray-900">{requirement.priority ?? '—'}</dd>
            </div>
            {requirement.epicKey && (
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Epic</dt>
                <dd className="mt-1 text-sm font-mono text-gray-900">{requirement.epicKey}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Linked Tests</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900">{requirement.coverageLinks.length}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Linked test cases */}
      <Card>
        <CardHeader>
          <CardTitle>Linked Test Cases ({requirement.coverageLinks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {requirement.coverageLinks.length === 0 ? (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 py-12">
              <p className="text-sm text-gray-400">No test cases linked to this requirement</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Test Key</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Latest Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Run</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requirement.coverageLinks.map(link => {
                    const latestExec = link.testCase.executions[0] ?? null
                    return (
                      <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{link.testCase.externalId}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{link.testCase.title}</td>
                        <td className="px-4 py-3">
                          <Badge variant="default">{link.testCase.testType}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {latestExec ? (
                            <Badge variant={STATUS_VARIANTS[latestExec.status] ?? 'default'}>
                              {STATUS_LABELS[latestExec.status] ?? latestExec.status}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">Not run</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {latestExec?.executedAt ? formatDate(latestExec.executedAt) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
