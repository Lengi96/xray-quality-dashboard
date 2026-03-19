import { prisma } from '@/lib/prisma'

export async function getRiskHotspots(projectId: string) {
  // Requirements with no test coverage
  const uncoveredWithDefects = await prisma.requirement.findMany({
    where: {
      projectId,
      coverageLinks: { none: {} },
    },
    take: 20,
    orderBy: [{ priority: 'asc' }],
  })

  return { uncoveredRequirements: uncoveredWithDefects }
}

export async function getFlakyTests(projectId: string) {
  const testCases = await prisma.testCase.findMany({
    where: { projectId },
    select: { id: true },
  })
  const ids = testCases.map((tc) => tc.id)

  const flakyExecutions = await prisma.testExecution.findMany({
    where: { testCaseId: { in: ids }, isFlaky: true },
    distinct: ['testCaseId'],
    include: {
      testCase: {
        select: { externalId: true, title: true, testType: true },
      },
    },
    orderBy: { flakyScore: 'desc' },
    take: 20,
  })

  return flakyExecutions
}

export async function getReleaseBlockers(projectId: string) {
  const CLOSED_STATUSES = ['Closed', 'Resolved', 'Done', 'Fixed']

  const [criticalDefects, failedOnCritical] = await Promise.all([
    prisma.defect.findMany({
      where: {
        projectId,
        severity: 'CRITICAL',
        status: { notIn: CLOSED_STATUSES },
      },
    }),
    // Test cases that are FAIL
    prisma.testExecution.findMany({
      where: {
        status: 'FAIL',
        testCase: { projectId },
      },
      include: {
        testCase: {
          select: {
            externalId: true,
            title: true,
            coverageLinks: {
              include: {
                requirement: {
                  select: {
                    externalId: true,
                    title: true,
                    priority: true,
                  },
                },
              },
            },
          },
        },
      },
      take: 10,
    }),
  ])

  return { criticalDefects, failedOnCritical }
}
