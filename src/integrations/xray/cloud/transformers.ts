import { RawTestCase, RawTestPlan, RawTestExecution, RawCoverageLink, RawTestSet } from '../../types'

export interface XrayCloudTest {
  issueId: string
  jira: { summary: string; status?: { name: string }; priority?: { name: string }; labels?: string[] }
  testType: { name: string }
  status?: { name: string }
  preconditions?: { results: { definition: string }[] }
  definition?: string
  lastModified?: string
}

export interface XrayCloudTestPlan {
  issueId: string
  jira: { summary: string; status?: { name: string } }
  status?: { name: string }
  version?: string
  startDate?: string
  endDate?: string
  lastModified?: string
}

export interface XrayCloudTestExecution {
  issueId: string
  test: { issueId: string }
  testPlan?: { issueId: string }
  status: { name: string }
  startedOn?: string
  finishedOn?: string
  environment?: string
  executedBy?: string
  comment?: string
  lastModified?: string
}

export interface XrayCloudCoverageLink {
  issueId: string // requirement
  coveredBy: { issueId: string }[] // tests
}

export function transformXrayCloudTest(t: XrayCloudTest): RawTestCase {
  return {
    externalId: t.issueId,
    title: t.jira.summary,
    testType: mapTestType(t.testType?.name),
    status: t.status?.name ?? t.jira.status?.name ?? 'TODO',
    priority: t.jira.priority?.name,
    labels: t.jira.labels ?? [],
    components: [],
    definition: t.definition,
    updatedAt: t.lastModified,
  }
}

export function transformXrayCloudTestPlan(tp: XrayCloudTestPlan): RawTestPlan {
  return {
    externalId: tp.issueId,
    name: tp.jira.summary,
    status: tp.status?.name ?? tp.jira.status?.name ?? 'TODO',
    version: tp.version,
    startDate: tp.startDate,
    endDate: tp.endDate,
    updatedAt: tp.lastModified,
  }
}

export function transformXrayCloudTestExecution(te: XrayCloudTestExecution): RawTestExecution {
  return {
    externalId: te.issueId,
    testCaseKey: te.test.issueId,
    testPlanKey: te.testPlan?.issueId,
    status: mapExecutionStatus(te.status.name),
    executedAt: te.finishedOn,
    environment: te.environment,
    executedBy: te.executedBy,
    comment: te.comment,
    updatedAt: te.lastModified,
  }
}

export function transformXrayCloudCoverageLink(item: XrayCloudCoverageLink): RawCoverageLink[] {
  return (item.coveredBy ?? []).map((test) => ({
    requirementKey: item.issueId,
    testCaseKey: test.issueId,
    linkType: 'tests',
  }))
}

function mapTestType(name?: string): string {
  if (!name) return 'MANUAL'
  const n = name.toUpperCase()
  if (n.includes('AUTO') || n.includes('CUCUMBER') || n.includes('GENERIC')) return 'AUTOMATED'
  return 'MANUAL'
}

function mapExecutionStatus(name: string): string {
  const n = name.toUpperCase()
  if (n === 'PASS' || n === 'PASSED') return 'PASS'
  if (n === 'FAIL' || n === 'FAILED') return 'FAIL'
  if (n === 'BLOCKED') return 'BLOCKED'
  if (n === 'EXECUTING') return 'EXECUTING'
  if (n === 'ABORTED') return 'ABORTED'
  return 'TODO'
}

// Placeholder — Xray Cloud uses test issue IDs for sets
export function makeEmptyTestSet(issueId: string, name: string, testIds: string[]): RawTestSet {
  return {
    externalId: issueId,
    name,
    testCaseKeys: testIds,
  }
}
