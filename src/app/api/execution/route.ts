import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getExecutionSummary,
  getExecutionResults,
  getTestPlans,
} from '@/server/queries/execution'

export const dynamic = 'force-dynamic'

// GET /api/execution?projectId=&planId=&type=summary|results|plans&status=&limit=&offset=
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'summary'
  const projectId = searchParams.get('projectId')
  const planId = searchParams.get('planId') ?? undefined

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }

  if (type === 'plans') {
    const data = await getTestPlans(projectId)
    return NextResponse.json({ data })
  }

  if (type === 'results') {
    const status = searchParams.get('status') ?? undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    const data = await getExecutionResults(projectId, planId, { status, limit, offset })
    return NextResponse.json({ data })
  }

  // default: summary
  const data = await getExecutionSummary(projectId, planId)
  return NextResponse.json({ data })
}
