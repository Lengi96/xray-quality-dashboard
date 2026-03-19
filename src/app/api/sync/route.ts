import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { runSync } from '@/sync/pipeline'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  projectId: z.string().min(1),
  full: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
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

  const parsed = bodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { projectId, full } = parsed.data
  const incremental = !full

  // Fire-and-forget: trigger async, return syncRunId immediately
  // We need to create the SyncRun first to get the ID, then run async
  let syncRunId: string

  try {
    // runSync creates the SyncRun record synchronously at start
    // We wrap in a promise that we don't await, but we need the syncRunId
    // So we run sync in background after getting the ID
    const syncPromise = runSync(projectId, incremental)

    // We can't easily get the ID before running without restructuring,
    // so we run the full pipeline async and return a 202 with a polling URL
    syncPromise.then(id => {
      // Sync completed (success or partial)
      void id
    }).catch(err => {
      // Pipeline fatal error already handled inside runSync
      console.error('Sync pipeline fatal error:', err)
    })

    // Since runSync is async, return accepted status — client polls /api/sync/status
    return NextResponse.json(
      {
        message: 'Sync triggered',
        projectId,
        incremental,
        statusUrl: `/api/sync/status?projectId=${projectId}`,
      },
      { status: 202 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to trigger sync', detail: String(error) },
      { status: 500 }
    )
  }
}
