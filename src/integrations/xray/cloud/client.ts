const XRAY_AUTH_URL = 'https://xray.cloud.getxray.app/api/v2/authenticate'
const XRAY_GRAPHQL_URL = 'https://xray.cloud.getxray.app/api/v2/graphql'

export class XrayCloudClient {
  private token: string | null = null
  private tokenExpiry: Date | null = null

  constructor(private clientId: string, private clientSecret: string) {}

  private async authenticate(): Promise<string> {
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token!
    }
    const res = await fetch(XRAY_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: this.clientId, client_secret: this.clientSecret }),
    })
    if (!res.ok) throw new Error(`Xray auth failed: ${res.status}`)
    this.token = (await res.json()) as string
    this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000) // ~55 minutes
    return this.token!
  }

  async graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const token = await this.authenticate()
    const res = await fetch(XRAY_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    })
    if (!res.ok) throw new Error(`Xray GraphQL error ${res.status}: ${await res.text()}`)
    const data = (await res.json()) as { data: T; errors?: unknown[] }
    if (data.errors) throw new Error(`Xray GraphQL errors: ${JSON.stringify(data.errors)}`)
    return data.data
  }
}
