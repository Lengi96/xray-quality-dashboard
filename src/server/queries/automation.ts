import { prisma } from '@/lib/prisma'

export async function getAutomationSummary(projectId: string) {
  const total = await prisma.testCase.count({ where: { projectId } })
  const automated = await prisma.testCase.count({
    where: { projectId, testType: 'AUTOMATED' },
  })
  const manual = await prisma.testCase.count({
    where: { projectId, testType: 'MANUAL' },
  })
  const generic = await prisma.testCase.count({
    where: { projectId, testType: 'GENERIC' },
  })

  // Automation by label
  const allTestCases = await prisma.testCase.findMany({
    where: { projectId },
    select: { labels: true, testType: true },
  })

  const labelStats: Record<string, { total: number; automated: number }> = {}
  for (const tc of allTestCases) {
    for (const label of tc.labels) {
      if (!labelStats[label]) labelStats[label] = { total: 0, automated: 0 }
      labelStats[label].total++
      if (tc.testType === 'AUTOMATED') labelStats[label].automated++
    }
  }

  return {
    total,
    automated,
    manual,
    generic,
    automationRate: total === 0 ? 0 : automated / total,
    byLabel: Object.entries(labelStats)
      .map(([label, stats]) => ({
        label,
        ...stats,
        rate: stats.total === 0 ? 0 : stats.automated / stats.total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10),
  }
}

export async function getAutomationGaps(projectId: string) {
  // Manual tests sorted by how many times they've been executed (high freq manual = automation ROI)
  const manualTests = await prisma.testCase.findMany({
    where: { projectId, testType: 'MANUAL' },
    include: {
      _count: { select: { executions: true } },
    },
    orderBy: { executions: { _count: 'desc' } },
    take: 25,
  })
  return manualTests
}
