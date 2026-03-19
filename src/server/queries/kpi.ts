import { prisma } from '@/lib/prisma'

export async function getLatestKpiSnapshot(projectId: string) {
  return prisma.kpiSnapshot.findFirst({
    where: { projectId },
    orderBy: { snapshotAt: 'desc' },
  })
}

export async function getKpiHistory(projectId: string, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return prisma.kpiSnapshot.findMany({
    where: { projectId, snapshotAt: { gte: since } },
    orderBy: { snapshotAt: 'asc' },
    select: {
      snapshotAt: true,
      readinessScore: true,
      readinessTier: true,
      coverageRate: true,
      executionProgress: true,
      passRate: true,
      automationRate: true,
      defectPressureScore: true,
    },
  })
}
