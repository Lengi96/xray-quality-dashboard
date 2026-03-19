export interface JiraClientConfig {
  baseUrl: string
  email: string
  apiToken: string
}

export class JiraClient {
  private headers: HeadersInit

  constructor(private config: JiraClientConfig) {
    const encoded = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64')
    this.headers = {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.config.baseUrl}/rest/api/3${path}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }
    const res = await fetch(url.toString(), { headers: this.headers })
    if (!res.ok) {
      throw new Error(`Jira API error ${res.status}: ${await res.text()}`)
    }
    return res.json() as Promise<T>
  }

  /** Paginate through all results using startAt/maxResults */
  async getAll<T>(path: string, params?: Record<string, string>): Promise<T[]> {
    const results: T[] = []
    let startAt = 0
    const maxResults = 100

    while (true) {
      const data = await this.get<{
        issues?: T[]
        values?: T[]
        total: number
        maxResults: number
        startAt: number
      }>(path, { ...params, startAt: String(startAt), maxResults: String(maxResults) })
      const items = (data.issues ?? data.values ?? []) as T[]
      results.push(...items)
      startAt += items.length
      if (startAt >= data.total || items.length === 0) break
    }
    return results
  }
}
