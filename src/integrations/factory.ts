import { IProjectAdapter, AdapterMode } from './types'

export interface AdapterConfig {
  mode: AdapterMode
  jiraBaseUrl?: string
  jiraEmail?: string
  jiraApiToken?: string
  xrayClientId?: string
  xrayClientSecret?: string
  xrayServerUrl?: string
}

export async function createAdapter(config: AdapterConfig): Promise<IProjectAdapter> {
  if (config.mode === 'mock' || process.env.DEMO_MODE === 'true') {
    const { MockAdapter } = await import('./mock/adapter')
    return new MockAdapter()
  }
  // Real adapters added in Phase 9
  throw new Error(`Adapter mode '${config.mode}' not yet implemented`)
}

export function getAdapterConfig(projectConfig: {
  useMock: boolean
  jiraBaseUrl?: string | null
  jiraEmail?: string | null
  xrayType?: string | null
}): AdapterConfig {
  if (projectConfig.useMock || process.env.DEMO_MODE === 'true') {
    return { mode: 'mock' }
  }
  return {
    mode: projectConfig.xrayType === 'XRAY_SERVER' ? 'jira-xray-server' : 'jira-xray-cloud',
    jiraBaseUrl: projectConfig.jiraBaseUrl ?? undefined,
    jiraEmail: projectConfig.jiraEmail ?? undefined,
  }
}
