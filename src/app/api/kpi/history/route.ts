import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getKpiHistory } from '@/server/queries/kpi'

export const dynamic = 'force-dynamic'

// GET /api/kpi/history?projectId=&days=30
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const daysParam = searchParams.get('days')

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }

  const days = daysParam ? parseInt(daysParam, 10) : 30
  if (isNaN(days) || days < 1) {
    return NextResponse.json({ error: 'days must be a positive integer' }, { status: 400 })
  }

  const history = await getKpiHistory(projectId, days)

  return NextResponse.json({ history }, { status: 200 })
}
