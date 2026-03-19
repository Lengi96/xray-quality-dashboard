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

  if (config.mode === 'jira-xray-cloud') {
    const { XrayCloudAdapter } = await import('./xray/cloud/adapter')
    return new XrayCloudAdapter({
      jiraBaseUrl: config.jiraBaseUrl!,
      jiraEmail: config.jiraEmail!,
      jiraApiToken: config.jiraApiToken!,
      xrayClientId: config.xrayClientId,
      xrayClientSecret: config.xrayClientSecret,
    })
  }

  if (config.mode === 'jira-xray-server') {
    const { JiraXrayServerAdapter } = await import('./xray/server/adapter')
    return new JiraXrayServerAdapter({
      jiraBaseUrl: config.jiraBaseUrl!,
      jiraEmail: config.jiraEmail!,
      jiraApiToken: config.jiraApiToken!,
    })
  }

  throw new Error(`Unknown adapter mode: ${config.mode}`)
}

export function getAdapterConfig(projectConfig: {
  useMock: boolean
  jiraBaseUrl?: string | null
  jiraEmail?: string | null
  xrayType?: string | null
  jiraApiToken?: string | null
  xrayClientId?: string | null
  xrayClientSecret?: string | null
}): AdapterConfig {
  if (projectConfig.useMock || process.env.DEMO_MODE === 'true') {
    return { mode: 'mock' }
  }
  return {
    mode: projectConfig.xrayType === 'XRAY_SERVER' ? 'jira-xray-server' : 'jira-xray-cloud',
    jiraBaseUrl: projectConfig.jiraBaseUrl ?? undefined,
    jiraEmail: projectConfig.jiraEmail ?? undefined,
    jiraApiToken: projectConfig.jiraApiToken ?? undefined,
    xrayClientId: projectConfig.xrayClientId ?? undefined,
    xrayClientSecret: projectConfig.xrayClientSecret ?? undefined,
  }
}
