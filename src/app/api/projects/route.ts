import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/projects — list all projects with latest SyncRun status and KpiSnapshot readiness
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    include: {
      config: {
        select: {
          useMock: true,
          jiraBaseUrl: true,
          jiraEmail: true,
          xrayClientIdEnc: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch latest SyncRun and KpiSnapshot for each project in batch
  const projectIds = projects.map(p => p.id)

  const [latestSyncRuns, latestKpiSnapshots] = await Promise.all([
    // Latest sync run per project
    prisma.syncRun.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { startedAt: 'desc' },
      distinct: ['projectId'],
      select: {
        id: true,
        projectId: true,
        status: true,
        startedAt: true,
        completedAt: true,
        itemsSynced: true,
        isIncremental: true,
        errorMessage: true,
        stages: true,
      },
    }),
    // Latest KPI snapshot per project
    prisma.kpiSnapshot.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { snapshotAt: 'desc' },
      distinct: ['projectId'],
      select: {
        projectId: true,
        readinessScore: true,
        readinessTier: true,
        coverageRate: true,
        passRate: true,
        automationRate: true,
        snapshotAt: true,
      },
    }),
  ])

  const syncRunMap = new Map(latestSyncRuns.map(sr => [sr.projectId, sr]))
  const kpiMap = new Map(latestKpiSnapshots.map(ks => [ks.projectId, ks]))

  const result = projects.map(project => ({
    ...project,
    latestSyncRun: syncRunMap.get(project.id) ?? null,
    latestKpiSnapshot: kpiMap.get(project.id) ?? null,
  }))

  return NextResponse.json({ projects: result }, { status: 200 })
}

// POST /api/projects — create a new project + ProjectConfig
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    name?: string
    externalId?: string
    platform?: string
    xrayType?: string
    useMock?: boolean
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, externalId, platform, xrayType, useMock = true } = body

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (!externalId || typeof externalId !== 'string') {
    return NextResponse.json({ error: 'externalId is required' }, { status: 400 })
  }
  if (!platform || (platform !== 'JIRA_CLOUD' && platform !== 'JIRA_SERVER')) {
    return NextResponse.json(
      { error: 'platform must be JIRA_CLOUD or JIRA_SERVER' },
      { status: 400 }
    )
  }

  // Validate optional xrayType
  if (xrayType && xrayType !== 'XRAY_CLOUD' && xrayType !== 'XRAY_SERVER') {
    return NextResponse.json(
      { error: 'xrayType must be XRAY_CLOUD or XRAY_SERVER' },
      { status: 400 }
    )
  }

  // Check for duplicate externalId
  const existing = await prisma.project.findUnique({ where: { externalId } })
  if (existing) {
    return NextResponse.json(
      { error: `Project with externalId '${externalId}' already exists` },
      { status: 409 }
    )
  }

  const project = await prisma.project.create({
    data: {
      name,
      externalId,
      platform: platform as 'JIRA_CLOUD' | 'JIRA_SERVER',
      xrayType: xrayType ? (xrayType as 'XRAY_CLOUD' | 'XRAY_SERVER') : null,
      config: {
        create: {
          useMock,
        },
      },
    },
    include: {
      config: true,
    },
  })

  return NextResponse.json({ project }, { status: 201 })
}
