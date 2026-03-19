/**
 * Domain TypeScript interfaces mirroring Prisma models.
 * Enums are re-exported from Prisma client for type consistency.
 */

// ─── RE-EXPORTED PRISMA ENUMS ─────────────────────────────────────────────────

export type {
  Platform,
  XrayType,
  RequirementType,
  TestType,
  ExecutionStatus,
  DefectSeverity,
  SyncStatus,
  ReadinessTier,
} from '@prisma/client'

// ─── DOMAIN INTERFACES ────────────────────────────────────────────────────────

import type {
  Platform,
  XrayType,
  RequirementType,
  TestType,
  ExecutionStatus,
  DefectSeverity,
  SyncStatus,
  ReadinessTier,
} from '@prisma/client'

export interface DomainProject {
  id: string
  externalId: string
  name: string
  platform: Platform
  xrayType?: XrayType | null
  description?: string | null
  createdAt: Date
  updatedAt: Date
  config?: DomainProjectConfig | null
}

export interface DomainProjectConfig {
  id: string
  projectId: string
  jiraBaseUrl?: string | null
  jiraEmail?: string | null
  jiraApiTokenEnc?: string | null
  xrayClientIdEnc?: string | null
  xrayClientSecretEnc?: string | null
  useMock: boolean
  readinessWeights: Record<string, number>
  severityWeights: Record<string, number>
  readinessGreenThreshold: number
  readinessAmberThreshold: number
  createdAt: Date
  updatedAt: Date
}

export interface DomainRequirement {
  id: string
  externalId: string
  projectId: string
  title: string
  description?: string | null
  type: RequirementType
  status: string
  priority?: string | null
  epicKey?: string | null
  assignee?: string | null
  labels: string[]
  components: string[]
  syncedAt: Date
  createdAt: Date
  updatedAt: Date
  coverageLinks?: DomainCoverageLink[]
}

export interface DomainTestCase {
  id: string
  externalId: string
  projectId: string
  title: string
  status: string
  testType: TestType
  priority?: string | null
  labels: string[]
  components: string[]
  preconditions?: string | null
  definition?: string | null
  automationDefId?: string | null
  syncedAt: Date
  createdAt: Date
  updatedAt: Date
  coverageLinks?: DomainCoverageLink[]
  executions?: DomainTestExecution[]
}

export interface DomainCoverageLink {
  id: string
  requirementId: string
  testCaseId: string
  linkType: string
  createdAt: Date
  requirement?: DomainRequirement
  testCase?: DomainTestCase
}

export interface DomainTestPlan {
  id: string
  externalId: string
  projectId: string
  name: string
  status: string
  version?: string | null
  startDate?: Date | null
  endDate?: Date | null
  syncedAt: Date
  createdAt: Date
  updatedAt: Date
  executions?: DomainTestExecution[]
}

export interface DomainTestExecution {
  id: string
  externalId: string
  projectId: string
  testCaseId: string
  testPlanId?: string | null
  status: ExecutionStatus
  executedAt?: Date | null
  duration?: number | null
  environment?: string | null
  isFlaky: boolean
  flakyScore?: number | null
  runNumber: number
  executedBy?: string | null
  comment?: string | null
  syncedAt: Date
  createdAt: Date
  testCase?: DomainTestCase
  testPlan?: DomainTestPlan | null
}

export interface DomainDefect {
  id: string
  externalId: string
  projectId: string
  title: string
  status: string
  severity: DefectSeverity
  priority?: string | null
  assignee?: string | null
  linkedTestKey?: string | null
  components: string[]
  labels: string[]
  syncedAt: Date
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date | null
}

export interface DomainSyncRun {
  id: string
  projectId: string
  status: SyncStatus
  startedAt: Date
  completedAt?: Date | null
  errorMessage?: string | null
  stages: Record<string, unknown>
  itemsSynced: number
  isIncremental: boolean
  createdAt: Date
}

export interface DomainKpiSnapshot {
  id: string
  projectId: string
  snapshotAt: Date

  totalRequirements: number
  coveredRequirements: number
  coverageRate: number

  totalPlanned: number
  totalExecuted: number
  executionProgress: number

  totalPassed: number
  passRate: number

  totalTests: number
  automatedTests: number
  automationRate: number

  openCritical: number
  openHigh: number
  openMedium: number
  openLow: number
  openTrivial: number
  defectPressureScore: number

  flakyTestCount: number
  flakyRate: number

  readinessScore: number
  readinessTier: ReadinessTier
  weightsSnapshot: Record<string, number>
}
