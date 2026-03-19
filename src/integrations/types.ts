/**
 * Integration layer types — normalized external API shapes BEFORE DB storage.
 * Intentionally independent from src/types/domain.ts.
 */

export interface FetchOptions {
  projectKey: string
  since?: Date        // for incremental sync
  maxResults?: number
}

export interface RawProject {
  externalId: string  // e.g. "DEMO"
  name: string
  description?: string
}

export interface RawRequirement {
  externalId: string  // e.g. "DEMO-1"
  title: string
  type: string        // 'EPIC' | 'STORY' | 'TASK'
  status: string
  priority?: string
  epicKey?: string
  assignee?: string
  labels?: string[]
  components?: string[]
  description?: string
  updatedAt?: string  // ISO date string
}

export interface RawTestCase {
  externalId: string
  title: string
  testType: string    // 'MANUAL' | 'AUTOMATED' | 'GENERIC'
  status: string
  priority?: string
  labels?: string[]
  components?: string[]
  preconditions?: string
  definition?: string
  automationDefId?: string
  updatedAt?: string
}

export interface RawTestPlan {
  externalId: string
  name: string
  status: string
  version?: string
  startDate?: string   // ISO date string
  endDate?: string
  updatedAt?: string
}

export interface RawTestSet {
  externalId: string
  name: string
  testCaseKeys: string[]
  updatedAt?: string
}

export interface RawTestExecution {
  externalId: string
  testCaseKey: string
  testPlanKey?: string
  status: string       // 'PASS' | 'FAIL' | 'BLOCKED' | 'TODO' | 'EXECUTING' | 'ABORTED'
  executedAt?: string  // ISO date string
  duration?: number    // milliseconds
  environment?: string
  executedBy?: string
  comment?: string
  updatedAt?: string
}

export interface RawDefect {
  externalId: string
  title: string
  status: string
  severity: string     // 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'TRIVIAL'
  priority?: string
  assignee?: string
  linkedTestKey?: string
  components?: string[]
  labels?: string[]
  resolvedAt?: string  // ISO date string
  updatedAt?: string
}

export interface RawCoverageLink {
  requirementKey: string
  testCaseKey: string
  linkType: string     // e.g. 'tests'
}

export interface IProjectAdapter {
  /** Test connectivity — throws on failure */
  healthCheck(): Promise<void>
  fetchProjects(): Promise<RawProject[]>
  fetchRequirements(opts: FetchOptions): Promise<RawRequirement[]>
  fetchTestCases(opts: FetchOptions): Promise<RawTestCase[]>
  fetchTestPlans(opts: FetchOptions): Promise<RawTestPlan[]>
  fetchTestSets(opts: FetchOptions): Promise<RawTestSet[]>
  fetchTestExecutions(opts: FetchOptions): Promise<RawTestExecution[]>
  fetchDefects(opts: FetchOptions): Promise<RawDefect[]>
  fetchCoverageLinks(opts: FetchOptions): Promise<RawCoverageLink[]>
}

export type AdapterMode = 'mock' | 'jira-xray-cloud' | 'jira-xray-server'
