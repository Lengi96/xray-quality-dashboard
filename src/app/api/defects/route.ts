import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDefectSummary, getDefectList } from '@/server/queries/defects'

export const dynamic = 'force-dynamic'

// GET /api/defects?projectId=&type=summary|list&severity=&status=&limit=&offset=
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'summary'
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }

  if (type === 'list') {
    const severity = searchParams.get('severity') ?? undefined
    const status = searchParams.get('status') ?? undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    const data = await getDefectList(projectId, { severity, status, limit, offset })
    return NextResponse.json({ data })
  }

  // default: summary
  const data = await getDefectSummary(projectId)
  return NextResponse.json({ data })
}
