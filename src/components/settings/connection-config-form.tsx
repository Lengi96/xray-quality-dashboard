'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ConnectionConfigFormProps {
  projectId: string
  initialConfig?: {
    jiraBaseUrl?: string | null
    jiraEmail?: string | null
    hasJiraToken?: boolean
    hasXrayClientId?: boolean
    hasXrayClientSecret?: boolean
    useMock?: boolean
  }
  onSaved?: () => void
}

export function ConnectionConfigForm({ projectId, initialConfig, onSaved }: ConnectionConfigFormProps) {
  const [jiraBaseUrl, setJiraBaseUrl] = useState(initialConfig?.jiraBaseUrl ?? '')
  const [jiraEmail, setJiraEmail] = useState(initialConfig?.jiraEmail ?? '')
  const [jiraApiToken, setJiraApiToken] = useState('')
  const [xrayType, setXrayType] = useState<'none' | 'cloud' | 'server'>('cloud')
  const [xrayClientId, setXrayClientId] = useState('')
  const [xrayClientSecret, setXrayClientSecret] = useState('')
  const [useMock, setUseMock] = useState(initialConfig?.useMock ?? false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleTestConnection() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/settings/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          useMock,
          jiraBaseUrl: jiraBaseUrl || undefined,
          jiraEmail: jiraEmail || undefined,
          jiraApiToken: jiraApiToken || undefined,
          xrayClientId: xrayClientId || undefined,
          xrayClientSecret: xrayClientSecret || undefined,
        }),
      })
      const data = await res.json()
      setTestResult(data)
    } catch (err) {
      setTestResult({ success: false, error: String(err) })
    } finally {
      setTesting(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const body: Record<string, unknown> = { projectId, useMock }
      if (jiraBaseUrl) body.jiraBaseUrl = jiraBaseUrl
      if (jiraEmail) body.jiraEmail = jiraEmail
      if (jiraApiToken) body.jiraApiToken = jiraApiToken
      if (xrayClientId) body.xrayClientId = xrayClientId
      if (xrayClientSecret) body.xrayClientSecret = xrayClientSecret

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Save failed')
      }
      onSaved?.()
    } catch (err) {
      setSaveError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Demo mode toggle */}
      <div className="flex items-center gap-3">
        <input
          id="useMock"
          type="checkbox"
          checked={useMock}
          onChange={(e) => setUseMock(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="useMock" className="text-sm font-medium text-gray-700">
          Demo mode (use mock data, no real API calls)
        </label>
      </div>

      {!useMock && (
        <>
          {/* Jira credentials */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Jira Connection
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jira Base URL
              </label>
              <input
                type="url"
                value={jiraBaseUrl}
                onChange={(e) => setJiraBaseUrl(e.target.value)}
                placeholder="https://your-org.atlassian.net"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jira Email
              </label>
              <input
                type="email"
                value={jiraEmail}
                onChange={(e) => setJiraEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jira API Token
                {initialConfig?.hasJiraToken && (
                  <span className="ml-2 text-xs text-green-600">(token saved)</span>
                )}
              </label>
              <input
                type="password"
                value={jiraApiToken}
                onChange={(e) => setJiraApiToken(e.target.value)}
                placeholder={initialConfig?.hasJiraToken ? 'Leave blank to keep existing token' : 'Enter API token'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Xray type selector */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Xray Integration
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xray Type</label>
              <select
                value={xrayType}
                onChange={(e) => setXrayType(e.target.value as 'none' | 'cloud' | 'server')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="none">None</option>
                <option value="cloud">Xray Cloud</option>
                <option value="server">Xray Server / Data Center</option>
              </select>
            </div>

            {xrayType === 'cloud' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xray Client ID
                    {initialConfig?.hasXrayClientId && (
                      <span className="ml-2 text-xs text-green-600">(saved)</span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={xrayClientId}
                    onChange={(e) => setXrayClientId(e.target.value)}
                    placeholder={initialConfig?.hasXrayClientId ? 'Leave blank to keep existing' : 'Xray Cloud Client ID'}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xray Client Secret
                    {initialConfig?.hasXrayClientSecret && (
                      <span className="ml-2 text-xs text-green-600">(saved)</span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={xrayClientSecret}
                    onChange={(e) => setXrayClientSecret(e.target.value)}
                    placeholder={initialConfig?.hasXrayClientSecret ? 'Leave blank to keep existing' : 'Xray Cloud Client Secret'}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Test connection result */}
      {testResult && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            testResult.success
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {testResult.success ? 'Connection successful!' : `Connection failed: ${testResult.error}`}
        </div>
      )}

      {saveError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {saveError}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {!useMock && (
          <Button variant="outline" onClick={handleTestConnection} disabled={testing}>
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
