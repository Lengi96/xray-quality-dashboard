'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface SyncRun {
  id: string
  status: 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED'
  startedAt: string
  completedAt?: string | null
  errorMessage?: string | null
  itemsSynced: number
  isIncremental: boolean
}

interface SyncControlPanelProps {
  projectId: string
}

const STATUS_COLORS: Record<SyncRun['status'], string> = {
  RUNNING: 'text-blue-700 bg-blue-50',
  SUCCESS: 'text-green-700 bg-green-50',
  PARTIAL: 'text-amber-700 bg-amber-50',
  FAILED: 'text-red-700 bg-red-50',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString()
}

function duration(start: string, end?: string | null): string {
  if (!end) return '—'
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const secs = Math.round(ms / 1000)
  if (secs < 60) return `${secs}s`
  return `${Math.floor(secs / 60)}m ${secs % 60}s`
}

export function SyncControlPanel({ projectId }: SyncControlPanelProps) {
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([])
  const [latestRun, setLatestRun] = useState<SyncRun | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadStatus() {
    try {
      const res = await fetch(`/api/sync/status?projectId=${projectId}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.syncRun) {
        setLatestRun(data.syncRun)
      }
    } catch {
      // silently ignore polling errors
    }
  }

  useEffect(() => {
    void loadStatus()
  }, [projectId])

  async function triggerSync(incremental: boolean) {
    setSyncing(true)
    setError(null)
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, incremental }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Sync trigger failed')
      }
      // Reload status after a short delay to pick up the new run
      setTimeout(() => {
        void loadStatus()
        setSyncing(false)
      }, 1500)
    } catch (err) {
      setError(String(err))
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Last sync status */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Last Sync</p>
          {latestRun ? (
            <div className="mt-1 space-y-0.5">
              <p className="text-sm text-gray-900">{formatDate(latestRun.startedAt)}</p>
              <span
                className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[latestRun.status]}`}
              >
                {latestRun.status}
              </span>
              {latestRun.completedAt && (
                <p className="text-xs text-gray-500">
                  Duration: {duration(latestRun.startedAt, latestRun.completedAt)} &middot;{' '}
                  {latestRun.itemsSynced} items synced
                </p>
              )}
              {latestRun.errorMessage && (
                <p className="text-xs text-red-600">{latestRun.errorMessage}</p>
              )}
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-500">No sync runs yet</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void triggerSync(true)}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Incremental Sync'}
          </Button>
          <Button size="sm" onClick={() => void triggerSync(false)} disabled={syncing}>
            {syncing ? 'Syncing...' : 'Full Sync'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Sync history placeholder — a real implementation would load from /api/sync/history */}
      {latestRun && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Sync Run</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                <th className="pb-2 font-medium">Started</th>
                <th className="pb-2 font-medium">Duration</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Items</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-900">{formatDate(latestRun.startedAt)}</td>
                <td className="py-2 text-gray-500">
                  {duration(latestRun.startedAt, latestRun.completedAt)}
                </td>
                <td className="py-2 text-gray-500">
                  {latestRun.isIncremental ? 'Incremental' : 'Full'}
                </td>
                <td className="py-2 text-gray-500">{latestRun.itemsSynced}</td>
                <td className="py-2">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[latestRun.status]}`}
                  >
                    {latestRun.status}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
