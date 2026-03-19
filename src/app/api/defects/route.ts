import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDefectSummary, getDefectList } from '@/server/queries/defects'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  projectId: z.string().min(1),
  severity: z.string().optional(),
  status: z.string().optional(),
})

// GET /api/defects?projectId=&type=summary|list&severity=&status=&limit=&offset=
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'summary'
  const parsed = querySchema.safeParse({
    projectId: searchParams.get('projectId'),
    severity: searchParams.get('severity') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }
  const { projectId } = parsed.data

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
