import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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

  const syncRun = await prisma.syncRun.findFirst({
    where: { projectId },
    orderBy: { startedAt: 'desc' },
  })

  if (!syncRun) {
    return NextResponse.json({ syncRun: null }, { status: 200 })
  }

  return NextResponse.json({ syncRun }, { status: 200 })
}
