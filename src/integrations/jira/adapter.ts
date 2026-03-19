import {
  IProjectAdapter,
  FetchOptions,
  RawProject,
  RawRequirement,
  RawTestCase,
  RawTestPlan,
  RawTestSet,
  RawTestExecution,
  RawDefect,
  RawCoverageLink,
} from '../types'
import { JiraClient } from './client'
import { transformJiraIssueToRequirement, transformJiraIssueToDefect } from './transformers'

export interface JiraAdapterConfig {
  jiraBaseUrl: string
  jiraEmail: string
  jiraApiToken: string
  xrayClientId?: string
  xrayClientSecret?: string
}

export class JiraXrayCloudAdapter implements IProjectAdapter {
  private jira: JiraClient

  constructor(private config: JiraAdapterConfig) {
    this.jira = new JiraClient({
      baseUrl: config.jiraBaseUrl,
      email: config.jiraEmail,
      apiToken: config.jiraApiToken,
    })
  }

  async healthCheck(): Promise<void> {
    await this.jira.get('/myself')
  }

  async fetchProjects(): Promise<RawProject[]> {
    const projects = await this.jira.getAll<{
      key: string
      name: string
      description?: string
    }>('/project/search')
    return projects.map((p) => ({
      externalId: p.key,
      name: p.name,
      description: p.description,
    }))
  }

  async fetchRequirements(opts: FetchOptions): Promise<RawRequirement[]> {
    const sinceClause = opts.since
      ? ` AND updated >= "${opts.since.toISOString().split('T')[0]}"`
      : ''
    const jql = `project = ${opts.projectKey} AND issuetype in (Epic, Story, "User Story", Task)${sinceClause}`
    const issues = await this.jira.getAll<Parameters<typeof transformJiraIssueToRequirement>[0]>(
      '/search',
      {
        jql,
        fields:
          'summary,issuetype,status,priority,assignee,labels,components,customfield_10014,parent,updated',
      }
    )
    return issues.map(transformJiraIssueToRequirement)
  }

  async fetchDefects(opts: FetchOptions): Promise<RawDefect[]> {
    const sinceClause = opts.since
      ? ` AND updated >= "${opts.since.toISOString().split('T')[0]}"`
      : ''
    const jql = `project = ${opts.projectKey} AND issuetype = Bug${sinceClause}`
    const issues = await this.jira.getAll<Parameters<typeof transformJiraIssueToDefect>[0]>(
      '/search',
      { jql, fields: 'summary,status,priority,assignee,labels,components,updated' }
    )
    return issues.map(transformJiraIssueToDefect)
  }

  // Xray Cloud test data — delegated to XrayCloudAdapter; stubs here return empty arrays
  async fetchTestCases(_opts: FetchOptions): Promise<RawTestCase[]> {
    return []
  }

  async fetchTestPlans(_opts: FetchOptions): Promise<RawTestPlan[]> {
    return []
  }

  async fetchTestSets(_opts: FetchOptions): Promise<RawTestSet[]> {
    return []
  }

  async fetchTestExecutions(_opts: FetchOptions): Promise<RawTestExecution[]> {
    return []
  }

  async fetchCoverageLinks(_opts: FetchOptions): Promise<RawCoverageLink[]> {
    return []
  }
}
