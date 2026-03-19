import {
  RawRequirement,
  RawTestCase,
  RawTestPlan,
  RawTestSet,
  RawTestExecution,
  RawDefect,
} from '@/integrations/types'

// ─── Requirements ─────────────────────────────────────────────────────────────

function normalizeRequirementType(type: string): 'EPIC' | 'STORY' | 'TASK' {
  const upper = type.toUpperCase()
  if (upper === 'EPIC') return 'EPIC'
  if (upper === 'STORY' || upper === 'USER_STORY') return 'STORY'
  return 'TASK'
}

export function normalizeRequirement(raw: RawRequirement, projectId: string, syncedAt: Date) {
  return {
    externalId: raw.externalId,
    projectId,
    title: raw.title,
    type: normalizeRequirementType(raw.type),
    status: raw.status,
    priority: raw.priority ?? null,
    epicKey: raw.epicKey ?? null,
    assignee: raw.assignee ?? null,
    labels: raw.labels ?? [],
    components: raw.components ?? [],
    description: raw.description ?? null,
    syncedAt,
  }
}

// ─── Test Cases ───────────────────────────────────────────────────────────────

function normalizeTestType(testType: string): 'MANUAL' | 'AUTOMATED' | 'GENERIC' {
  const upper = testType.toUpperCase()
  if (upper === 'MANUAL') return 'MANUAL'
  if (upper === 'AUTOMATED') return 'AUTOMATED'
  return 'GENERIC'
}

export function normalizeTestCase(raw: RawTestCase, projectId: string, syncedAt: Date) {
  return {
    externalId: raw.externalId,
    projectId,
    title: raw.title,
    testType: normalizeTestType(raw.testType),
    status: raw.status,
    priority: raw.priority ?? null,
    labels: raw.labels ?? [],
    components: raw.components ?? [],
    preconditions: raw.preconditions ?? null,
    definition: raw.definition ?? null,
    automationDefId: raw.automationDefId ?? null,
    syncedAt,
  }
}

// ─── Test Plans ───────────────────────────────────────────────────────────────

export function normalizeTestPlan(raw: RawTestPlan, projectId: string, syncedAt: Date) {
  return {
    externalId: raw.externalId,
    projectId,
    name: raw.name,
    status: raw.status,
    version: raw.version ?? null,
    startDate: raw.startDate ? new Date(raw.startDate) : null,
    endDate: raw.endDate ? new Date(raw.endDate) : null,
    syncedAt,
  }
}

// ─── Test Sets ────────────────────────────────────────────────────────────────

export function normalizeTestSet(raw: RawTestSet, projectId: string, syncedAt: Date) {
  return {
    externalId: raw.externalId,
    projectId,
    name: raw.name,
    syncedAt,
  }
}

// ─── Test Executions ──────────────────────────────────────────────────────────

function normalizeExecutionStatus(
  status: string
): 'PASS' | 'FAIL' | 'BLOCKED' | 'TODO' | 'EXECUTING' | 'ABORTED' {
  const upper = status.toUpperCase()
  if (upper === 'PASS' || upper === 'PASSED') return 'PASS'
  if (upper === 'FAIL' || upper === 'FAILED') return 'FAIL'
  if (upper === 'BLOCKED') return 'BLOCKED'
  if (upper === 'EXECUTING' || upper === 'IN_PROGRESS') return 'EXECUTING'
  if (upper === 'ABORTED') return 'ABORTED'
  return 'TODO'
}

export function normalizeTestExecution(
  raw: RawTestExecution,
  projectId: string,
  testCaseId: string,
  testPlanId: string | null,
  syncedAt: Date
) {
  return {
    externalId: raw.externalId,
    projectId,
    testCaseId,
    testPlanId,
    status: normalizeExecutionStatus(raw.status),
    executedAt: raw.executedAt ? new Date(raw.executedAt) : null,
    duration: raw.duration ?? null,
    environment: raw.environment ?? null,
    executedBy: raw.executedBy ?? null,
    comment: raw.comment ?? null,
    syncedAt,
  }
}

// ─── Defects ──────────────────────────────────────────────────────────────────

function normalizeDefectSeverity(
  severity: string
): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'TRIVIAL' {
  const upper = severity.toUpperCase()
  if (upper === 'CRITICAL') return 'CRITICAL'
  if (upper === 'HIGH') return 'HIGH'
  if (upper === 'MEDIUM') return 'MEDIUM'
  if (upper === 'LOW') return 'LOW'
  return 'TRIVIAL'
}

export function normalizeDefect(raw: RawDefect, projectId: string, syncedAt: Date) {
  return {
    externalId: raw.externalId,
    projectId,
    title: raw.title,
    status: raw.status,
    severity: normalizeDefectSeverity(raw.severity),
    priority: raw.priority ?? null,
    assignee: raw.assignee ?? null,
    linkedTestKey: raw.linkedTestKey ?? null,
    components: raw.components ?? [],
    labels: raw.labels ?? [],
    resolvedAt: raw.resolvedAt ? new Date(raw.resolvedAt) : null,
    syncedAt,
  }
}
