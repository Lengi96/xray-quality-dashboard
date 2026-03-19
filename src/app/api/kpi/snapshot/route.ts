import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLatestKpiSnapshot } from '@/server/queries/kpi'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const querySchema = z.object({ projectId: z.string().min(1) })

// GET /api/kpi/snapshot?projectId=
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({ projectId: searchParams.get('projectId') })
  if (!parsed.success) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }
  const { projectId } = parsed.data

  const snapshot = await getLatestKpiSnapshot(projectId)

  if (!snapshot) {
    return NextResponse.json({ snapshot: null }, { status: 200 })
  }

  return NextResponse.json({ snapshot }, { status: 200 })
}
