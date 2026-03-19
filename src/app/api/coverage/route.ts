import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCoverageSummary,
  getUncoveredRequirements,
  getRequirementDetail,
} from '@/server/queries/coverage'

export const dynamic = 'force-dynamic'

// GET /api/coverage?projectId=&type=summary|uncovered|detail&requirementId=&priority=&reqType=&limit=&offset=
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'summary'
  const projectId = searchParams.get('projectId')

  if (type === 'detail') {
    const requirementId = searchParams.get('requirementId')
    if (!requirementId) {
      return NextResponse.json({ error: 'requirementId is required' }, { status: 400 })
    }
    const data = await getRequirementDetail(requirementId)
    return NextResponse.json({ data })
  }

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }

  if (type === 'uncovered') {
    const priority = searchParams.get('priority') ?? undefined
    const reqType = searchParams.get('reqType') ?? undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    const data = await getUncoveredRequirements(projectId, { priority, type: reqType, limit, offset })
    return NextResponse.json({ data })
  }

  // default: summary
  const data = await getCoverageSummary(projectId)
  return NextResponse.json({ data })
}
