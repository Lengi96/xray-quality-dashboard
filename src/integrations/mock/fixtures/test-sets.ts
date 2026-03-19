import { RawTestSet } from '../../types'

export const MOCK_TEST_SETS: RawTestSet[] = [
  {
    externalId: 'TS-1',
    name: 'Authentication & Security Smoke Tests',
    testCaseKeys: ['TC-1', 'TC-2', 'TC-3', 'TC-76', 'TC-77', 'TC-78', 'TC-79', 'TC-80'],
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    externalId: 'TS-2',
    name: 'Checkout & Payment Regression Suite',
    testCaseKeys: ['TC-16', 'TC-17', 'TC-18', 'TC-19', 'TC-20', 'TC-21', 'TC-26', 'TC-27', 'TC-28', 'TC-29', 'TC-30'],
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    externalId: 'TS-3',
    name: 'Automated Regression Suite',
    testCaseKeys: Array.from({ length: 50 }, (_, i) => `TC-${121 + i}`),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    externalId: 'TS-4',
    name: 'Mobile App Test Suite',
    testCaseKeys: ['TC-66', 'TC-67', 'TC-68', 'TC-69', 'TC-70'],
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    externalId: 'TS-5',
    name: 'Full Regression Suite',
    testCaseKeys: Array.from({ length: 60 }, (_, i) => `TC-${i + 1}`),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
