import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getKpiHistory } from '@/server/queries/kpi'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  projectId: z.string().min(1),
  days: z.coerce.number().int().min(1).max(365).default(30),
})

// GET /api/kpi/history?projectId=&days=30
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({
    projectId: searchParams.get('projectId'),
    days: searchParams.get('days') ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query params' }, { status: 400 })
  }
  const { projectId, days } = parsed.data

  const history = await getKpiHistory(projectId, days)

  return NextResponse.json({ history }, { status: 200 })
}
