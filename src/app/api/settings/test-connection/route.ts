import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdapter, AdapterConfig } from '@/integrations/factory'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    mode?: string
    jiraBaseUrl?: string
    jiraEmail?: string
    jiraApiToken?: string
    xrayClientId?: string
    xrayClientSecret?: string
    useMock?: boolean
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const config: AdapterConfig = {
    mode: body.useMock
      ? 'mock'
      : body.xrayClientId
        ? 'jira-xray-cloud'
        : (body.mode as AdapterConfig['mode']) ?? 'jira-xray-cloud',
    jiraBaseUrl: body.jiraBaseUrl,
    jiraEmail: body.jiraEmail,
    jiraApiToken: body.jiraApiToken,
    xrayClientId: body.xrayClientId,
    xrayClientSecret: body.xrayClientSecret,
  }

  try {
    const adapter = await createAdapter(config)
    await adapter.healthCheck()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 200 })
  }
}
