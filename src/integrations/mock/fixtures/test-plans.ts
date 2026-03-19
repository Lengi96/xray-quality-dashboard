import { RawTestPlan } from '../../types'

export const MOCK_TEST_PLANS: RawTestPlan[] = [
  {
    externalId: 'TP-1',
    name: 'Sprint 24 - Release Candidate v2.4',
    status: 'In Progress',
    version: 'v2.4',
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
