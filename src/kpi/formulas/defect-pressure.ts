import { prisma } from '@/lib/prisma'
import { SEVERITY_WEIGHTS, DEFECT_PRESSURE_NORMALIZER } from '@/lib/constants'

export interface DefectPressureResult {
  openCritical: number
  openHigh: number
  openMedium: number
  openLow: number
  openTrivial: number
  rawScore: number
  pressureScore: number // 0.0-1.0, INVERTED: higher = less pressure = better
}

const CLOSED_STATUSES = ['Closed', 'Resolved', 'Done', 'Fixed', "Won't Fix", 'Duplicate']

export async function calculateDefectPressure(projectId: string): Promise<DefectPressureResult> {
  const counts = await prisma.defect.groupBy({
    by: ['severity'],
    where: { projectId, status: { notIn: CLOSED_STATUSES } },
    _count: true,
  })

  const bySeverity: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    TRIVIAL: 0,
  }
  for (const row of counts) {
    if (row.severity in bySeverity) {
      bySeverity[row.severity] = row._count
    }
  }

  const rawScore =
    bySeverity.CRITICAL * SEVERITY_WEIGHTS.CRITICAL +
    bySeverity.HIGH * SEVERITY_WEIGHTS.HIGH +
    bySeverity.MEDIUM * SEVERITY_WEIGHTS.MEDIUM +
    bySeverity.LOW * SEVERITY_WEIGHTS.LOW +
    bySeverity.TRIVIAL * SEVERITY_WEIGHTS.TRIVIAL

  // Inverted: 1 = no pressure, 0 = maximum pressure
  const pressureScore = Math.max(0, 1 - rawScore / DEFECT_PRESSURE_NORMALIZER)

  return {
    openCritical: bySeverity.CRITICAL,
    openHigh: bySeverity.HIGH,
    openMedium: bySeverity.MEDIUM,
    openLow: bySeverity.LOW,
    openTrivial: bySeverity.TRIVIAL,
    rawScore,
    pressureScore,
  }
}
