import { RawCoverageLink } from '../../types'

/**
 * Coverage links connecting 65 of 80 requirements to test cases.
 *
 * Uncovered requirements:
 *   - DEMO-16 to DEMO-20: 5 epics (API Integration Layer, Content Management,
 *     Customer Support, Promotions & Discounts, Shipping & Delivery)
 *   - DEMO-71 to DEMO-80: 10 stories (last 10 stories in the set)
 *
 * Covered: DEMO-1 to DEMO-15 (15 epics) + DEMO-21 to DEMO-70 (50 stories) = 65 requirements
 * Each covered requirement links to 1-3 test cases → ~130-195 total links, target ~160
 */

const links: RawCoverageLink[] = []

/**
 * Map of requirementKey → array of test case keys to link to.
 * Epics (DEMO-1 to DEMO-15) each get 3 links.
 * Stories (DEMO-21 to DEMO-70) alternate between 2 and 3 links.
 * Total = 15 epics × 3 + 50 stories × ~2.3 ≈ 45 + 115 = 160 links.
 */

// Test case pool assignment: spread across TC-1 to TC-120 (manual tests) and TC-121 to TC-170 (automated)
// We rotate through test cases systematically to avoid too many duplicates.

let tcCounter = 1

function nextTc(): string {
  // Cycle through TC-1 to TC-170 — avoids TC-171+ (generic) to keep coverage realistic
  const key = `TC-${tcCounter}`
  tcCounter++
  if (tcCounter > 170) tcCounter = 1
  return key
}

// Epics DEMO-1 to DEMO-15: 3 links each = 45 links
for (let epicNum = 1; epicNum <= 15; epicNum++) {
  const reqKey = `DEMO-${epicNum}`
  links.push({ requirementKey: reqKey, testCaseKey: nextTc(), linkType: 'tests' })
  links.push({ requirementKey: reqKey, testCaseKey: nextTc(), linkType: 'tests' })
  links.push({ requirementKey: reqKey, testCaseKey: nextTc(), linkType: 'tests' })
}
// 45 links so far; tcCounter = 46

// Stories DEMO-21 to DEMO-70: 50 stories
// Alternate 2 and 3 links to hit ~115 more links (50 stories × 2.3)
// Pattern: stories at index 0,3,6,... get 3 links; others get 2 links
// 50 stories: 17 get 3 links (51), 33 get 2 links (66) = 117 links
// Total: 45 + 117 = 162 links — close enough to 160
for (let storyIndex = 0; storyIndex < 50; storyIndex++) {
  const storyNum = 21 + storyIndex
  const reqKey = `DEMO-${storyNum}`
  const linksCount = storyIndex % 3 === 0 ? 3 : 2
  for (let j = 0; j < linksCount; j++) {
    links.push({ requirementKey: reqKey, testCaseKey: nextTc(), linkType: 'tests' })
  }
}

export const MOCK_COVERAGE_LINKS: RawCoverageLink[] = links
