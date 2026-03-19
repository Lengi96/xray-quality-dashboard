import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ConnectionConfigForm } from '@/components/settings/connection-config-form'
import { SyncControlPanel } from '@/components/settings/sync-control-panel'
import { WeightSliders } from '@/components/settings/weight-sliders'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ projectId?: string }>
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { projectId } = await searchParams

  // Load projects for the selector
  const projects = await prisma.project.findMany({
    select: { id: true, name: true, externalId: true },
    orderBy: { createdAt: 'desc' },
  })

  const selectedProjectId = projectId ?? projects[0]?.id ?? null

  // Load config for selected project
  const config = selectedProjectId
    ? await prisma.projectConfig.findUnique({
        where: { projectId: selectedProjectId },
      })
    : null

  const initialConfig = config
    ? {
        jiraBaseUrl: config.jiraBaseUrl,
        jiraEmail: config.jiraEmail,
        hasJiraToken: !!config.jiraApiTokenEnc,
        hasXrayClientId: !!config.xrayClientIdEnc,
        hasXrayClientSecret: !!config.xrayClientSecretEnc,
        useMock: config.useMock,
        readinessWeights: config.readinessWeights as Record<string, number>,
      }
    : undefined

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your Jira and Xray integration, sync schedule, and readiness score weights.
        </p>
      </div>

      {/* Project selector */}
      {projects.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
          <form method="get">
            <select
              name="projectId"
              defaultValue={selectedProjectId ?? ''}
              onChange={(e) => {
                const form = (e.target as HTMLSelectElement).closest('form') as HTMLFormElement
                form?.submit()
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.externalId})
                </option>
              ))}
            </select>
          </form>
        </div>
      )}

      {selectedProjectId ? (
        <>
          {/* Section 1: Connection Configuration */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Configuration</h2>
            <ConnectionConfigForm
              projectId={selectedProjectId}
              initialConfig={initialConfig}
            />
          </section>

          {/* Section 2: Sync Control */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sync Control</h2>
            <SyncControlPanel projectId={selectedProjectId} />
          </section>

          {/* Section 3: Readiness Score Weights */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Readiness Score Weights</h2>
            <p className="text-sm text-gray-500 mb-4">
              Adjust how each metric contributes to the overall readiness score. Weights must sum to 100%.
            </p>
            <WeightSliders
              projectId={selectedProjectId}
              initialWeights={
                initialConfig?.readinessWeights
                  ? (initialConfig.readinessWeights as {
                      coverageRate: number
                      executionProgress: number
                      passRate: number
                      automationRate: number
                      defectPressure: number
                    })
                  : undefined
              }
            />
          </section>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          No projects found. Create a project first via the API or seed the database.
        </div>
      )}
    </div>
  )
}
