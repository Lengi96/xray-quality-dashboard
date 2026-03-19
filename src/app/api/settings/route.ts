import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encryptIfPresent } from '@/lib/encryption'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const putBodySchema = z.object({
  projectId: z.string().min(1),
  jiraBaseUrl: z.string().url().optional().or(z.literal('')),
  jiraEmail: z.string().email().optional().or(z.literal('')),
  jiraApiToken: z.string().optional(),
  xrayClientId: z.string().optional(),
  xrayClientSecret: z.string().optional(),
  xrayBaseUrl: z.string().url().optional().or(z.literal('')),
  greenThreshold: z.number().min(0).max(100).optional(),
  amberThreshold: z.number().min(0).max(100).optional(),
  useMock: z.boolean().optional(),
  readinessWeights: z.record(z.string(), z.number()).optional(),
})

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  if (!projectId) {
    return NextResponse.json({ error: 'projectId query param is required' }, { status: 400 })
  }

  const config = await prisma.projectConfig.findUnique({ where: { projectId } })
  if (!config) {
    return NextResponse.json({ config: null })
  }

  // Never expose raw tokens — redact them, expose only boolean presence
  return NextResponse.json({
    config: {
      id: config.id,
      projectId: config.projectId,
      jiraBaseUrl: config.jiraBaseUrl,
      jiraEmail: config.jiraEmail,
      hasJiraToken: !!config.jiraApiTokenEnc,
      hasXrayClientId: !!config.xrayClientIdEnc,
      hasXrayClientSecret: !!config.xrayClientSecretEnc,
      useMock: config.useMock,
      readinessWeights: config.readinessWeights,
      severityWeights: config.severityWeights,
      readinessGreenThreshold: config.readinessGreenThreshold,
      readinessAmberThreshold: config.readinessAmberThreshold,
      updatedAt: config.updatedAt,
    },
  })
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = putBodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { projectId, jiraBaseUrl, jiraEmail, jiraApiToken, xrayClientId, xrayClientSecret, useMock, readinessWeights } = parsed.data

  // Build partial update — only update token fields if new values are provided
  const updateData: Record<string, unknown> = {}
  if (jiraBaseUrl !== undefined) updateData.jiraBaseUrl = jiraBaseUrl
  if (jiraEmail !== undefined) updateData.jiraEmail = jiraEmail
  if (jiraApiToken !== undefined) updateData.jiraApiTokenEnc = encryptIfPresent(jiraApiToken)
  if (xrayClientId !== undefined) updateData.xrayClientIdEnc = encryptIfPresent(xrayClientId)
  if (xrayClientSecret !== undefined) updateData.xrayClientSecretEnc = encryptIfPresent(xrayClientSecret)
  if (useMock !== undefined) updateData.useMock = useMock
  if (readinessWeights !== undefined) updateData.readinessWeights = readinessWeights

  const config = await prisma.projectConfig.upsert({
    where: { projectId },
    update: updateData,
    create: {
      projectId,
      jiraBaseUrl: jiraBaseUrl ?? null,
      jiraEmail: jiraEmail ?? null,
      jiraApiTokenEnc: encryptIfPresent(jiraApiToken),
      xrayClientIdEnc: encryptIfPresent(xrayClientId),
      xrayClientSecretEnc: encryptIfPresent(xrayClientSecret),
      useMock: useMock ?? true,
      readinessWeights: readinessWeights ?? {
        coverageRate: 0.25,
        executionProgress: 0.20,
        passRate: 0.25,
        automationRate: 0.10,
        defectPressure: 0.20,
      },
    },
  })

  return NextResponse.json({ success: true, configId: config.id })
}
