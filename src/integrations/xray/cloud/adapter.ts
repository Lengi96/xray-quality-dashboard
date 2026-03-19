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
} from '../../types'
import { JiraXrayCloudAdapter, JiraAdapterConfig } from '../../jira/adapter'
import { XrayCloudClient } from './client'
import {
  transformXrayCloudTest,
  transformXrayCloudTestPlan,
  transformXrayCloudTestExecution,
  transformXrayCloudCoverageLink,
  XrayCloudTest,
  XrayCloudTestPlan,
  XrayCloudTestExecution,
  XrayCloudCoverageLink,
} from './transformers'

export class XrayCloudAdapter implements IProjectAdapter {
  private jiraAdapter: JiraXrayCloudAdapter
  private xray: XrayCloudClient

  constructor(private config: JiraAdapterConfig) {
    this.jiraAdapter = new JiraXrayCloudAdapter(config)
    if (!config.xrayClientId || !config.xrayClientSecret) {
      throw new Error('Xray Cloud requires xrayClientId and xrayClientSecret')
    }
    this.xray = new XrayCloudClient(config.xrayClientId, config.xrayClientSecret)
  }

  async healthCheck(): Promise<void> {
    await this.jiraAdapter.healthCheck()
  }

  fetchProjects(): Promise<RawProject[]> {
    return this.jiraAdapter.fetchProjects()
  }

  fetchRequirements(opts: FetchOptions): Promise<RawRequirement[]> {
    return this.jiraAdapter.fetchRequirements(opts)
  }

  fetchDefects(opts: FetchOptions): Promise<RawDefect[]> {
    return this.jiraAdapter.fetchDefects(opts)
  }

  async fetchTestCases(opts: FetchOptions): Promise<RawTestCase[]> {
    const data = await this.xray.graphql<{ getTests: { results: XrayCloudTest[] } }>(
      `query GetTests($projectKey: String!, $limit: Int!) {
        getTests(projectKey: $projectKey, limit: $limit) {
          results {
            issueId
            jira(fields: ["summary", "status", "priority", "labels"])
            testType { name }
            status { name }
            definition
            lastModified
          }
        }
      }`,
      { projectKey: opts.projectKey, limit: opts.maxResults ?? 100 }
    )
    return (data.getTests?.results ?? []).map(transformXrayCloudTest)
  }

  async fetchTestPlans(opts: FetchOptions): Promise<RawTestPlan[]> {
    const data = await this.xray.graphql<{ getTestPlans: { results: XrayCloudTestPlan[] } }>(
      `query GetTestPlans($projectKey: String!, $limit: Int!) {
        getTestPlans(projectKey: $projectKey, limit: $limit) {
          results {
            issueId
            jira(fields: ["summary", "status"])
            status { name }
            startDate
            endDate
            lastModified
          }
        }
      }`,
      { projectKey: opts.projectKey, limit: opts.maxResults ?? 100 }
    )
    return (data.getTestPlans?.results ?? []).map(transformXrayCloudTestPlan)
  }

  async fetchTestSets(_opts: FetchOptions): Promise<RawTestSet[]> {
    // Xray Cloud does not have a dedicated TestSet GraphQL query — return empty
    return []
  }

  async fetchTestExecutions(opts: FetchOptions): Promise<RawTestExecution[]> {
    const data = await this.xray.graphql<{
      getTestExecutions: { results: XrayCloudTestExecution[] }
    }>(
      `query GetTestExecutions($projectKey: String!, $limit: Int!) {
        getTestExecutions(projectKey: $projectKey, limit: $limit) {
          results {
            issueId
            test { issueId }
            testPlan { issueId }
            status { name }
            startedOn
            finishedOn
            environment
            executedBy
            comment
            lastModified
          }
        }
      }`,
      { projectKey: opts.projectKey, limit: opts.maxResults ?? 100 }
    )
    return (data.getTestExecutions?.results ?? []).map(transformXrayCloudTestExecution)
  }

  async fetchCoverageLinks(opts: FetchOptions): Promise<RawCoverageLink[]> {
    const data = await this.xray.graphql<{
      getRequirements: { results: XrayCloudCoverageLink[] }
    }>(
      `query GetCoverage($projectKey: String!, $limit: Int!) {
        getRequirements(projectKey: $projectKey, limit: $limit) {
          results {
            issueId
            coveredBy {
              issueId
            }
          }
        }
      }`,
      { projectKey: opts.projectKey, limit: opts.maxResults ?? 200 }
    )
    const links: RawCoverageLink[] = []
    for (const item of data.getRequirements?.results ?? []) {
      links.push(...transformXrayCloudCoverageLink(item))
    }
    return links
  }
}
