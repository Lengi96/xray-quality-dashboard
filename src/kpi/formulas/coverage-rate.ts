import { prisma } from '@/lib/prisma'

export interface CoverageRateResult {
  totalRequirements: number
  coveredRequirements: number
  rate: number // 0.0-1.0
}

export async function calculateCoverageRate(projectId: string): Promise<CoverageRateResult> {
  const total = await prisma.requirement.count({ where: { projectId } })
  const covered = await prisma.requirement.count({
    where: { projectId, coverageLinks: { some: {} } },
  })
  return {
    totalRequirements: total,
    coveredRequirements: covered,
    rate: total === 0 ? 0 : covered / total,
  }
}
