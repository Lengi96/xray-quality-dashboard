export interface XrayServerClientConfig {
  baseUrl: string
  email: string
  apiToken: string
}

export class XrayServerClient {
  private headers: HeadersInit

  constructor(private config: XrayServerClientConfig) {
    const encoded = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64')
    this.headers = {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.config.baseUrl}${path}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }
    const res = await fetch(url.toString(), { headers: this.headers })
    if (!res.ok) {
      throw new Error(`Xray Server API error ${res.status}: ${await res.text()}`)
    }
    return res.json() as Promise<T>
  }

  async getAll<T>(path: string, params?: Record<string, string>): Promise<T[]> {
    const results: T[] = []
    let page = 1
    const limit = 100

    while (true) {
      const items = await this.get<T[]>(path, {
        ...params,
        page: String(page),
        limit: String(limit),
      })
      if (!Array.isArray(items) || items.length === 0) break
      results.push(...items)
      if (items.length < limit) break
      page++
    }
    return results
  }
}
