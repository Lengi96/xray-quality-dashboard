import { prisma } from '@/lib/prisma'

export async function getDefectSummary(projectId: string) {
  const CLOSED_STATUSES = ['Closed', 'Resolved', 'Done', 'Fixed']

  const open = await prisma.defect.groupBy({
    by: ['severity'],
    where: { projectId, status: { notIn: CLOSED_STATUSES } },
    _count: true,
  })

  const total = await prisma.defect.count({ where: { projectId } })
  const totalOpen = await prisma.defect.count({
    where: { projectId, status: { notIn: CLOSED_STATUSES } },
  })

  const bySeverity: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    TRIVIAL: 0,
  }
  for (const row of open) bySeverity[row.severity] = row._count

  // Age distribution
  const now = new Date()
  const day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [older7, older30, older90] = await Promise.all([
    prisma.defect.count({
      where: {
        projectId,
        status: { notIn: CLOSED_STATUSES },
        createdAt: { lte: day7 },
      },
    }),
    prisma.defect.count({
      where: {
        projectId,
        status: { notIn: CLOSED_STATUSES },
        createdAt: { lte: day30 },
      },
    }),
    prisma.defect.count({
      where: {
        projectId,
        status: { notIn: CLOSED_STATUSES },
        createdAt: { lte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  return {
    total,
    totalOpen,
    bySeverity,
    ageDistribution: { older7, older30, older90 },
  }
}

export async function getDefectList(
  projectId: string,
  options?: {
    severity?: string
    status?: string
    limit?: number
    offset?: number
  }
) {
  const CLOSED_STATUSES = ['Closed', 'Resolved', 'Done', 'Fixed']
  const where = {
    projectId,
    ...(options?.severity ? { severity: options.severity as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'TRIVIAL' } : {}),
    ...(options?.status === 'open'
      ? { status: { notIn: CLOSED_STATUSES } }
      : options?.status
      ? { status: options.status }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.defect.findMany({
      where,
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
      orderBy: [{ severity: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.defect.count({ where }),
  ])
  return { items, total }
}
