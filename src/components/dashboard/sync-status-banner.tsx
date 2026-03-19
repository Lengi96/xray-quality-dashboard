'use client'

import { useState } from 'react'

interface SyncStatusBannerProps {
  projectId: string
  lastSyncAt?: string | null
  lastSyncStatus?: string | null
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function SyncStatusBanner({
  projectId,
  lastSyncAt,
  lastSyncStatus,
}: SyncStatusBannerProps) {
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localSyncAt, setLocalSyncAt] = useState<string | null>(null)

  async function handleSync() {
    setSyncing(true)
    setError(null)
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, incremental: false }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Sync failed')
      }
      setLocalSyncAt(new Date().toISOString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const effectiveSyncAt = localSyncAt ?? lastSyncAt

  const statusColor =
    lastSyncStatus === 'COMPLETED'
      ? 'bg-green-50 border-green-200 text-green-800'
      : lastSyncStatus === 'FAILED'
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-gray-50 border-gray-200 text-gray-700'

  return (
    <div className={`mb-4 flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm ${statusColor}`}>
      <div className="flex items-center gap-2">
        {syncing ? (
          <>
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            <span className="text-blue-700">Syncing data…</span>
          </>
        ) : effectiveSyncAt ? (
          <>
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                lastSyncStatus === 'COMPLETED' ? 'bg-green-500' :
                lastSyncStatus === 'FAILED' ? 'bg-red-500' : 'bg-gray-400'
              }`}
            />
            <span>Last synced {timeAgo(effectiveSyncAt)}</span>
          </>
        ) : (
          <>
            <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
            <span>Never synced</span>
          </>
        )}
        {error && <span className="ml-2 text-red-600">{error}</span>}
      </div>
      <button
        onClick={handleSync}
        disabled={syncing}
        className="ml-4 rounded-md bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {syncing ? 'Syncing…' : 'Sync Now'}
      </button>
    </div>
  )
}
