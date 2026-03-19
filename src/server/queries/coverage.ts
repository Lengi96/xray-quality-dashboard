import { prisma } from '@/lib/prisma'

export async function getCoverageSummary(projectId: string) {
  const total = await prisma.requirement.count({ where: { projectId } })
  const covered = await prisma.requirement.count({
    where: { projectId, coverageLinks: { some: {} } },
  })
  const byType = await prisma.requirement.groupBy({
    by: ['type'],
    where: { projectId },
    _count: true,
  })
  const coveredByType = await prisma.requirement.groupBy({
    by: ['type'],
    where: { projectId, coverageLinks: { some: {} } },
    _count: true,
  })
  return {
    total,
    covered,
    uncovered: total - covered,
    rate: total === 0 ? 0 : covered / total,
    byType: byType.map(row => ({
      type: row.type,
      total: row._count,
      covered: coveredByType.find(c => c.type === row.type)?._count ?? 0,
    })),
  }
}

export async function getUncoveredRequirements(
  projectId: string,
  options?: { priority?: string; type?: string; limit?: number; offset?: number }
) {
  const where = {
    projectId,
    coverageLinks: { none: {} },
    ...(options?.priority ? { priority: options.priority } : {}),
    ...(options?.type ? { type: options.type as 'EPIC' | 'STORY' | 'TASK' } : {}),
  }
  const [items, total] = await Promise.all([
    prisma.requirement.findMany({
      where,
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
      orderBy: [{ priority: 'asc' }, { externalId: 'asc' }],
    }),
    prisma.requirement.count({ where }),
  ])
  return { items, total }
}

export async function getRequirementDetail(requirementId: string) {
  return prisma.requirement.findUnique({
    where: { id: requirementId },
    include: {
      coverageLinks: {
        include: {
          testCase: {
            include: {
              executions: {
                orderBy: { executedAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      },
    },
  })
}
