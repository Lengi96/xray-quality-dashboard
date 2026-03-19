import { IProjectAdapter } from '@/integrations/types'

export interface StageResult {
  stage: string
  itemsSynced: number
  status: 'done' | 'error' | 'skipped'
  error?: string
}

export interface SyncContext {
  syncRunId: string
  projectId: string
  projectKey: string
  adapter: IProjectAdapter
  since?: Date
}
