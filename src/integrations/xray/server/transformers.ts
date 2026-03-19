import { RawTestCase, RawTestPlan, RawTestExecution, RawCoverageLink, RawTestSet } from '../../types'

export interface XrayServerTest {
  key: string
  fields: {
    summary: string
    status: { name: string }
    priority?: { name: string }
    labels?: string[]
    components?: { name: string }[]
    updated?: string
    // Xray custom fields
    customfield_testType?: { value: string }
    customfield_testDefinition?: string
  }
}

export interface XrayServerTestPlan {
  key: string
  fields: {
    summary: string
    status: { name: string }
    updated?: string
    fixVersions?: { name: string }[]
    duedate?: string
    customfield_startDate?: string
  }
}

export interface XrayServerTestSet {
  key: string
  fields: {
    summary: string
    updated?: string
    customfield_testSetTests?: { key: string }[]
  }
}

export interface XrayServerTestExecution {
  key: string
  testKey: string
  testPlanKey?: string
  status: string
  startedOn?: string
  finishedOn?: string
  executedBy?: string
  comment?: string
  environments?: string[]
}

export interface XrayServerCoverageLink {
  key: string // requirement key
  tests?: { key: string }[] // covered by
}

export function transformXrayServerTest(t: XrayServerTest): RawTestCase {
  const testTypeVal = t.fields.customfield_testType?.value ?? 'Manual'
  return {
    externalId: t.key,
    title: t.fields.summary,
    testType: mapTestType(testTypeVal),
    status: t.fields.status.name,
    priority: t.fields.priority?.name,
    labels: t.fields.labels ?? [],
    components: t.fields.components?.map((c) => c.name) ?? [],
    definition: t.fields.customfield_testDefinition,
    updatedAt: t.fields.updated,
  }
}

export function transformXrayServerTestPlan(tp: XrayServerTestPlan): RawTestPlan {
  return {
    externalId: tp.key,
    name: tp.fields.summary,
    status: tp.fields.status.name,
    version: tp.fields.fixVersions?.[0]?.name,
    startDate: tp.fields.customfield_startDate,
    endDate: tp.fields.duedate,
    updatedAt: tp.fields.updated,
  }
}

export function transformXrayServerTestSet(ts: XrayServerTestSet): RawTestSet {
  return {
    externalId: ts.key,
    name: ts.fields.summary,
    testCaseKeys: ts.fields.customfield_testSetTests?.map((t) => t.key) ?? [],
    updatedAt: ts.fields.updated,
  }
}

export function transformXrayServerTestExecution(te: XrayServerTestExecution): RawTestExecution {
  return {
    externalId: te.key,
    testCaseKey: te.testKey,
    testPlanKey: te.testPlanKey,
    status: mapExecutionStatus(te.status),
    executedAt: te.finishedOn,
    environment: te.environments?.[0],
    executedBy: te.executedBy,
    comment: te.comment,
  }
}

export function transformXrayServerCoverageLinks(item: XrayServerCoverageLink): RawCoverageLink[] {
  return (item.tests ?? []).map((test) => ({
    requirementKey: item.key,
    testCaseKey: test.key,
    linkType: 'tests',
  }))
}

function mapTestType(name: string): string {
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
