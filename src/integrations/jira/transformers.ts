import { RawRequirement, RawDefect } from '../types'

export interface JiraIssue {
  key: string
  fields: {
    summary: string
    issuetype: { name: string }
    status: { name: string }
    priority?: { name: string }
    assignee?: { displayName: string }
    labels?: string[]
    components?: { name: string }[]
    description?: unknown
    customfield_10014?: string // Epic link (Jira Server)
    parent?: { key: string } // Parent epic (Jira Cloud NextGen)
    updated?: string
  }
}

export function transformJiraIssueToRequirement(issue: JiraIssue): RawRequirement {
  const type = mapIssueType(issue.fields.issuetype.name)
  const epicKey = issue.fields.customfield_10014 ?? issue.fields.parent?.key ?? undefined

  return {
    externalId: issue.key,
    title: issue.fields.summary,
    type,
    status: issue.fields.status.name,
    priority: issue.fields.priority?.name,
    epicKey: type !== 'EPIC' ? epicKey : undefined,
    assignee: issue.fields.assignee?.displayName,
    labels: issue.fields.labels ?? [],
    components: issue.fields.components?.map((c) => c.name) ?? [],
    updatedAt: issue.fields.updated,
  }
}

export function transformJiraIssueToDefect(issue: JiraIssue): RawDefect {
  return {
    externalId: issue.key,
    title: issue.fields.summary,
    status: issue.fields.status.name,
    severity: mapPriorityToSeverity(issue.fields.priority?.name),
    priority: issue.fields.priority?.name,
    assignee: issue.fields.assignee?.displayName,
    components: issue.fields.components?.map((c) => c.name) ?? [],
    labels: issue.fields.labels ?? [],
    updatedAt: issue.fields.updated,
  }
}

function mapIssueType(name: string): 'EPIC' | 'STORY' | 'TASK' {
  const upper = name.toUpperCase()
  if (upper === 'EPIC') return 'EPIC'
  if (upper.includes('STORY') || upper.includes('USER STORY')) return 'STORY'
  return 'TASK'
}

function mapPriorityToSeverity(priority?: string): string {
  if (!priority) return 'MEDIUM'
  const p = priority.toUpperCase()
  if (p === 'CRITICAL' || p === 'BLOCKER') return 'CRITICAL'
  if (p === 'HIGH' || p === 'MAJOR') return 'HIGH'
  if (p === 'LOW' || p === 'MINOR') return 'LOW'
  if (p === 'TRIVIAL') return 'TRIVIAL'
  return 'MEDIUM'
}
