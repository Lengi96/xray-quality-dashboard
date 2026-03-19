import { prisma } from '@/lib/prisma'

export interface AutomationRateResult {
  totalTests: number
  automatedTests: number
  rate: number // 0.0-1.0
}

export async function calculateAutomationRate(projectId: string): Promise<AutomationRateResult> {
  const total = await prisma.testCase.count({ where: { projectId } })
  const automated = await prisma.testCase.count({ where: { projectId, testType: 'AUTOMATED' } })
  return {
    totalTests: total,
    automatedTests: automated,
    rate: total === 0 ? 0 : automated / total,
  }
}
