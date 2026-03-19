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
import { XrayServerClient } from './client'
import {
  transformXrayServerTest,
  transformXrayServerTestPlan,
  transformXrayServerTestSet,
  transformXrayServerTestExecution,
  transformXrayServerCoverageLinks,
  XrayServerTest,
  XrayServerTestPlan,
  XrayServerTestSet,
  XrayServerTestExecution,
  XrayServerCoverageLink,
} from './transformers'

const RAVEN = '/rest/raven/1.0/api'

export class JiraXrayServerAdapter implements IProjectAdapter {
  private jiraAdapter: JiraXrayCloudAdapter
  private xray: XrayServerClient

  constructor(private config: JiraAdapterConfig) {
    this.jiraAdapter = new JiraXrayCloudAdapter(config)
    this.xray = new XrayServerClient({
      baseUrl: config.jiraBaseUrl,
      email: config.jiraEmail,
      apiToken: config.jiraApiToken,
    })
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
    const items = await this.xray.getAll<XrayServerTest>(`${RAVEN}/test`, {
      projectKey: opts.projectKey,
    })
    return items.map(transformXrayServerTest)
  }

  async fetchTestPlans(opts: FetchOptions): Promise<RawTestPlan[]> {
    const items = await this.xray.getAll<XrayServerTestPlan>(`${RAVEN}/testplan`, {
      projectKey: opts.projectKey,
    })
    return items.map(transformXrayServerTestPlan)
  }

  async fetchTestSets(opts: FetchOptions): Promise<RawTestSet[]> {
    const items = await this.xray.getAll<XrayServerTestSet>(`${RAVEN}/testset`, {
      projectKey: opts.projectKey,
    })
    return items.map(transformXrayServerTestSet)
  }

  async fetchTestExecutions(opts: FetchOptions): Promise<RawTestExecution[]> {
    const items = await this.xray.getAll<XrayServerTestExecution>(`${RAVEN}/testrun`, {
      projectKey: opts.projectKey,
    })
    return items.map(transformXrayServerTestExecution)
  }

  async fetchCoverageLinks(opts: FetchOptions): Promise<RawCoverageLink[]> {
    const items = await this.xray.getAll<XrayServerCoverageLink>(`${RAVEN}/requirement`, {
      projectKey: opts.projectKey,
    })
    const links: RawCoverageLink[] = []
    for (const item of items) {
      links.push(...transformXrayServerCoverageLinks(item))
    }
    return links
  }
}
