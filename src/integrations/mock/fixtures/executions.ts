import { RawTestExecution } from '../../types'

const TEST_PLAN_KEY = 'TP-1'
const BASE_NOW = Date.now()
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Returns an ISO date string for a random point in the last 14 days,
 * seeded deterministically by the execution index.
 */
function recentDate(index: number): string {
  // Spread executions across last 14 days using index as a deterministic offset
  const hoursAgo = (index % (14 * 24))
  return new Date(BASE_NOW - hoursAgo * 60 * 60 * 1000).toISOString()
}

const ENVIRONMENTS = ['staging', 'staging', 'staging', 'uat', 'ci']
const EXECUTORS = [
  'alice@demo.com',
  'bob@demo.com',
  'carol@demo.com',
  'dave@demo.com',
  'alice@demo.com',
]

const executions: RawTestExecution[] = []

// EX-1 to EX-115: PASS (testCaseKey = TC-1 to TC-115)
for (let i = 0; i < 115; i++) {
  const exNum = i + 1
  const tcNum = i + 1
  executions.push({
    externalId: `EX-${exNum}`,
    testCaseKey: `TC-${tcNum}`,
    testPlanKey: TEST_PLAN_KEY,
    status: 'PASS',
    executedAt: recentDate(i * 2),
    duration: 1000 + (i * 37 % 9000),
    environment: ENVIRONMENTS[i % ENVIRONMENTS.length],
    executedBy: EXECUTORS[i % EXECUTORS.length],
    updatedAt: recentDate(i * 2),
  })
}

// EX-116 to EX-133: FAIL (testCaseKey = TC-116 to TC-133)
for (let i = 0; i < 18; i++) {
  const exNum = 116 + i
  const tcNum = 116 + i
  executions.push({
    externalId: `EX-${exNum}`,
    testCaseKey: `TC-${tcNum}`,
    testPlanKey: TEST_PLAN_KEY,
    status: 'FAIL',
    executedAt: recentDate(i * 3 + 1),
    duration: 2000 + (i * 53 % 8000),
    environment: ENVIRONMENTS[i % ENVIRONMENTS.length],
    executedBy: EXECUTORS[i % EXECUTORS.length],
    comment: `Test failed: assertion error on step ${(i % 5) + 2}`,
    updatedAt: recentDate(i * 3 + 1),
  })
}

// EX-134 to EX-140: BLOCKED (testCaseKey = TC-134 to TC-140)
for (let i = 0; i < 7; i++) {
  const exNum = 134 + i
  const tcNum = 134 + i
  executions.push({
    externalId: `EX-${exNum}`,
    testCaseKey: `TC-${tcNum}`,
    testPlanKey: TEST_PLAN_KEY,
    status: 'BLOCKED',
    executedAt: recentDate(i * 4 + 2),
    environment: ENVIRONMENTS[i % ENVIRONMENTS.length],
    executedBy: EXECUTORS[i % EXECUTORS.length],
    comment: 'Blocked by environment issue',
    updatedAt: recentDate(i * 4 + 2),
  })
}

// EX-141 to EX-160: TODO (testCaseKey = TC-141 to TC-160)
for (let i = 0; i < 20; i++) {
  const exNum = 141 + i
  const tcNum = 141 + i
  executions.push({
    externalId: `EX-${exNum}`,
    testCaseKey: `TC-${tcNum}`,
    testPlanKey: TEST_PLAN_KEY,
    status: 'TODO',
    updatedAt: new Date(BASE_NOW - DAY_MS).toISOString(),
  })
}

// EX-200 to EX-207: previous runs for TC-121 to TC-128 (the flaky ones)
// TC-121 is in EX-1 range ... wait, TC-121 maps to EX-1 only if tcNum == exNum.
// TC-121 through TC-128 are automated tests. Their current-cycle executions fall in the TODO range
// (EX-141 to EX-160 covers TC-141 to TC-160), so the flaky ones (TC-121 to TC-128) currently
// appear as PASSed (EX-1 only covers TC-1 to TC-115; TC-116-133 are FAIL; TC-134-140 BLOCKED;
// TC-141-160 are TODO).
// TC-121 is NOT in the main 160 executions (EX-1 covers TC-1..TC-115, then TC-116..TC-133 FAIL).
// Actually: TC-121 falls in the PASS range (TC-1 to TC-115 → no). TC-121 > 115, so TC-116..133 FAIL.
// TC-121 is in FAIL range (EX-116+5 = EX-121 for TC-121? Let's check: EX-116 → TC-116, EX-117 → TC-117
// ... EX-121 → TC-121... yes, TC-121 to TC-128 map to EX-121 to EX-128 which are FAIL status.
//
// So the flaky ones (TC-121 to TC-128) have current status FAIL.
// Their previous runs (EX-200 to EX-207) should be PASS to show flakiness.
for (let i = 0; i < 8; i++) {
  const exNum = 200 + i
  const tcNum = 121 + i
  executions.push({
    externalId: `EX-${exNum}`,
    testCaseKey: `TC-${tcNum}`,
    testPlanKey: TEST_PLAN_KEY,
    status: 'PASS', // opposite of current FAIL → demonstrates flakiness
    executedAt: recentDate(20 + i * 5), // earlier run
    duration: 1500 + (i * 43 % 5000),
    environment: ENVIRONMENTS[i % ENVIRONMENTS.length],
    executedBy: EXECUTORS[i % EXECUTORS.length],
    comment: 'Previous run passed — flaky test',
    updatedAt: recentDate(20 + i * 5),
  })
}

export const MOCK_EXECUTIONS: RawTestExecution[] = executions
