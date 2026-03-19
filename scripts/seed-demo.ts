import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const EXECUTION_STATUSES = ['PASS', 'PASS', 'PASS', 'PASS', 'FAIL', 'BLOCKED', 'TODO', 'PASS'] as const

function isoDate(daysAgo: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d
}

async function main() {
  console.log('Seeding demo data...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      passwordHash: hashedPassword,
    },
  })
  console.log(`Created user: ${user.email}`)

  // Create demo project
  const project = await prisma.project.upsert({
    where: { externalId: 'DEMO' },
    update: {},
    create: {
      name: 'Demo Project',
      externalId: 'DEMO',
      platform: 'JIRA_CLOUD',
      xrayType: 'XRAY_CLOUD',
    },
  })
  console.log(`Created project: ${project.externalId}`)

  // Create project config
  await prisma.projectConfig.upsert({
    where: { projectId: project.id },
    update: {},
    create: {
      projectId: project.id,
      useMock: true,
      readinessGreenThreshold: 75,
      readinessAmberThreshold: 50,
      readinessWeights: {
        coverageRate: 0.25,
        executionProgress: 0.20,
        passRate: 0.25,
        automationRate: 0.10,
        defectPressure: 0.20,
      },
    },
  })
  console.log('Created project config')

  // Create requirements (20 epics + 60 stories = 80 total)
  const epicExternalIds: string[] = []
  for (let i = 1; i <= 20; i++) {
    epicExternalIds.push(`DEMO-${i}`)
  }

  const epicNames = [
    'User Authentication & Authorization',
    'Product Catalog Management',
    'Shopping Cart & Checkout',
    'Order Management',
    'Payment Processing',
    'Search & Filtering',
    'Reviews & Ratings',
    'User Profile Management',
    'Admin Dashboard',
    'Notifications & Emails',
    'Inventory Management',
    'Reporting & Analytics',
    'Mobile App Support',
    'Performance Optimization',
    'Security Hardening',
    'API Integration Layer',
    'Content Management',
    'Customer Support',
    'Promotions & Discounts',
    'Shipping & Delivery',
  ]

  console.log('Creating requirements...')
  const requirementIds: string[] = []
  const requirementMap = new Map<string, string>() // externalId -> db id

  // Create epics
  for (let i = 0; i < 20; i++) {
    const req = await prisma.requirement.upsert({
      where: { externalId_projectId: { externalId: `DEMO-${i + 1}`, projectId: project.id } },
      update: {},
      create: {
        externalId: `DEMO-${i + 1}`,
        projectId: project.id,
        title: epicNames[i],
        type: 'EPIC',
        status: i < 10 ? 'In Progress' : 'Open',
        priority: i < 10 ? 'High' : 'Medium',
        labels: ['epic'],
        components: ['frontend', 'backend'],
        syncedAt: isoDate(i * 2),
      },
    })
    requirementIds.push(req.id)
    requirementMap.set(req.externalId, req.id)
  }

  // Create 60 stories (3 per epic)
  const storyTitles = [
    'As a user, I want to log in with email and password',
    'As a user, I want to reset my password via email',
    'As an admin, I want to manage user roles and permissions',
    'As a user, I want to browse products by category',
    'As a user, I want to view detailed product information',
    'As an admin, I want to add and edit product listings',
    'As a user, I want to add items to my shopping cart',
    'As a user, I want to update item quantities in cart',
    'As a user, I want to proceed to checkout from cart',
    'As a user, I want to view my order history',
    'As a user, I want to track my current order status',
    'As an admin, I want to process and fulfill orders',
    'As a user, I want to pay with credit or debit card',
    'As a user, I want to save payment methods for future use',
    'As a user, I want to receive payment confirmation emails',
    'As a user, I want to search products by keyword',
    'As a user, I want to filter search results by price range',
    'As a user, I want to sort search results by relevance',
    'As a user, I want to leave a review on a purchased product',
    'As a user, I want to rate products with a star rating',
    'As a user, I want to read other customers\' reviews',
    'As a user, I want to update my personal information',
    'As a user, I want to manage my shipping addresses',
    'As a user, I want to view my wishlist',
    'As an admin, I want to view a sales overview dashboard',
    'As an admin, I want to manage customer accounts',
    'As an admin, I want to configure site settings',
    'As a user, I want to receive order status email notifications',
    'As a user, I want to opt in to promotional emails',
    'As an admin, I want to send bulk email campaigns',
    'As an admin, I want to track product stock levels',
    'As an admin, I want to receive low stock alerts',
    'As an admin, I want to manage product variants',
    'As an admin, I want to generate monthly sales reports',
    'As an admin, I want to export customer data to CSV',
    'As an admin, I want to view conversion funnel analytics',
    'As a user, I want to use the mobile app on iOS',
    'As a user, I want to use the mobile app on Android',
    'As a user, I want push notifications on my mobile device',
    'As a user, I want pages to load in under 2 seconds',
    'As a user, I want search results to appear instantly',
    'As an admin, I want to monitor site performance metrics',
    'As a user, I want my data encrypted at rest and in transit',
    'As an admin, I want to enforce two-factor authentication',
    'As an admin, I want to audit user login history',
    'As a developer, I want to integrate with third-party payment APIs',
    'As a developer, I want to consume the product catalog via REST API',
    'As a developer, I want OAuth2 authentication for API access',
    'As an admin, I want to manage homepage banner content',
    'As an admin, I want to publish and schedule blog posts',
    'As an admin, I want to manage static pages like About Us',
    'As a user, I want to submit a support ticket',
    'As an admin, I want to respond to customer support tickets',
    'As a user, I want to access a help center knowledge base',
    'As an admin, I want to create discount coupon codes',
    'As a user, I want to apply a coupon code at checkout',
    'As an admin, I want to configure buy-one-get-one promotions',
    'As a user, I want to choose a shipping method at checkout',
    'As an admin, I want to configure shipping rates by region',
    'As a user, I want to track my shipment with a tracking number',
  ]

  for (let i = 0; i < 60; i++) {
    const epicIndex = Math.floor(i / 3)
    const epicKey = `DEMO-${epicIndex + 1}`
    const req = await prisma.requirement.upsert({
      where: { externalId_projectId: { externalId: `DEMO-${21 + i}`, projectId: project.id } },
      update: {},
      create: {
        externalId: `DEMO-${21 + i}`,
        projectId: project.id,
        title: storyTitles[i],
        type: 'STORY',
        status: i % 4 === 0 ? 'Done' : i % 3 === 0 ? 'In Review' : 'In Progress',
        priority: i % 5 === 0 ? 'Critical' : i % 3 === 0 ? 'High' : 'Medium',
        epicKey,
        labels: ['story'],
        components: ['frontend', 'backend'],
        syncedAt: isoDate(i),
      },
    })
    requirementIds.push(req.id)
    requirementMap.set(req.externalId, req.id)
  }
  console.log(`Created ${requirementIds.length} requirements`)

  // Create test cases (180 total: 120 manual, 50 automated, 10 generic)
  console.log('Creating test cases...')
  const testCaseIds: string[] = []

  // 120 manual test cases
  for (let i = 1; i <= 120; i++) {
    const tc = await prisma.testCase.upsert({
      where: { externalId_projectId: { externalId: `TC-${i}`, projectId: project.id } },
      update: {},
      create: {
        externalId: `TC-${i}`,
        projectId: project.id,
        title: `Verify test case TC-${i}`,
        testType: 'MANUAL',
        status: i % 6 === 0 ? 'Deprecated' : i % 3 === 0 ? 'Draft' : 'Ready',
        priority: i % 5 === 0 ? 'Critical' : i % 3 === 0 ? 'High' : 'Medium',
        labels: i % 2 === 0 ? ['smoke', 'regression'] : ['regression'],
        components: ['frontend', 'backend'],
        syncedAt: isoDate(i % 30),
      },
    })
    testCaseIds.push(tc.id)
  }

  // 50 automated test cases
  for (let i = 121; i <= 170; i++) {
    const tc = await prisma.testCase.upsert({
      where: { externalId_projectId: { externalId: `TC-${i}`, projectId: project.id } },
      update: {},
      create: {
        externalId: `TC-${i}`,
        projectId: project.id,
        title: `Automated: regression test TC-${i}`,
        testType: 'AUTOMATED',
        status: 'Ready',
        priority: i % 3 === 0 ? 'High' : 'Medium',
        labels: ['automated', 'regression'],
        components: ['backend'],
        automationDefId: `automation://selenium/test-TC-${i}`,
        definition: `automation://selenium/test-TC-${i}`,
        syncedAt: isoDate(i % 30),
      },
    })
    testCaseIds.push(tc.id)
  }

  // 10 generic test cases
  for (let i = 171; i <= 180; i++) {
    const tc = await prisma.testCase.upsert({
      where: { externalId_projectId: { externalId: `TC-${i}`, projectId: project.id } },
      update: {},
      create: {
        externalId: `TC-${i}`,
        projectId: project.id,
        title: `Exploratory test TC-${i}`,
        testType: 'GENERIC',
        status: 'Draft',
        priority: 'Low',
        labels: ['exploratory'],
        components: ['frontend'],
        syncedAt: isoDate(i % 30),
      },
    })
    testCaseIds.push(tc.id)
  }
  console.log(`Created ${testCaseIds.length} test cases`)

  // Create coverage links (link first 130 test cases to requirements)
  // epics 1-15 (index 0-14) get coverage; epics 16-20 are uncovered
  console.log('Creating coverage links...')
  let coverageCount = 0
  for (let reqIdx = 0; reqIdx < 65; reqIdx++) {
    // each covered requirement gets 2 test cases
    const tcIdx1 = (reqIdx * 2) % testCaseIds.length
    const tcIdx2 = (reqIdx * 2 + 1) % testCaseIds.length
    const reqId = requirementIds[reqIdx]
    if (!reqId) continue

    for (const tcIdx of [tcIdx1, tcIdx2]) {
      const tcId = testCaseIds[tcIdx]
      if (!tcId) continue
      await prisma.coverageLink.upsert({
        where: { requirementId_testCaseId: { requirementId: reqId, testCaseId: tcId } },
        update: {},
        create: {
          requirementId: reqId,
          testCaseId: tcId,
          linkType: 'tests',
        },
      })
      coverageCount++
    }
  }
  console.log(`Created ${coverageCount} coverage links`)

  // Create a test plan
  const testPlan = await prisma.testPlan.upsert({
    where: { externalId_projectId: { externalId: 'PLAN-1', projectId: project.id } },
    update: {},
    create: {
      externalId: 'PLAN-1',
      projectId: project.id,
      name: 'Sprint 10 Regression Test Plan',
      status: 'In Progress',
      version: '1.0',
      startDate: isoDate(14),
      endDate: isoDate(-7),
      syncedAt: isoDate(1),
    },
  })
  console.log(`Created test plan: ${testPlan.externalId}`)

  // Create test executions (130 executions for plan)
  console.log('Creating test executions...')
  let execCount = 0
  for (let i = 0; i < 130; i++) {
    const tcId = testCaseIds[i]
    if (!tcId) continue
    const status = EXECUTION_STATUSES[i % EXECUTION_STATUSES.length]
    const isFlaky = i >= 120 && i < 128 // TC-121 to TC-128 are flaky
    await prisma.testExecution.upsert({
      where: { externalId_projectId: { externalId: `EXEC-${i + 1}`, projectId: project.id } },
      update: {},
      create: {
        externalId: `EXEC-${i + 1}`,
        projectId: project.id,
        testCaseId: tcId,
        testPlanId: testPlan.id,
        status,
        executedAt: status !== 'TODO' ? isoDate(Math.floor(i / 10)) : null,
        duration: status !== 'TODO' ? 1000 + (i * 37) % 5000 : null,
        environment: 'staging',
        isFlaky,
        flakyScore: isFlaky ? 0.3 + (i % 5) * 0.1 : null,
        runNumber: 1,
        executedBy: ['alice@demo.com', 'bob@demo.com', 'carol@demo.com'][i % 3],
        syncedAt: isoDate(Math.floor(i / 10)),
      },
    })
    execCount++
  }
  console.log(`Created ${execCount} test executions`)

  // Create defects
  console.log('Creating defects...')
  const defectSeverities = ['CRITICAL', 'CRITICAL', 'HIGH', 'HIGH', 'HIGH', 'MEDIUM', 'MEDIUM', 'MEDIUM', 'LOW', 'TRIVIAL'] as const
  const defectTitles = [
    'Login fails intermittently with valid credentials',
    'Payment processing times out under load',
    'Cart total miscalculated with discount codes',
    'Search results show deleted products',
    'Order history pagination breaks on page 3+',
    'Password reset link expires too quickly',
    'Admin bulk action fails for >100 items',
    'Product images fail to load on mobile Safari',
    'Email notifications sent with incorrect timezone',
    'Export CSV truncates long product descriptions',
    'Wishlist items lost after session expiry',
    'Stock level badge shows incorrect count',
    'Two-factor auth challenge not triggered on new device',
    'API rate limiting returns 500 instead of 429',
    'Review submission fails for non-ASCII characters',
    'Shipping rate calculation incorrect for international orders',
    'GDPR data export missing purchase history',
    'Push notification deep links broken on Android',
    'Performance: homepage load exceeds 3s on slow connections',
    'SQL error on concurrent checkout with same coupon code',
  ]
  for (let i = 0; i < 20; i++) {
    const severity = defectSeverities[i % defectSeverities.length]
    const isResolved = i >= 15 // last 5 are resolved
    await prisma.defect.upsert({
      where: { externalId_projectId: { externalId: `BUG-${i + 1}`, projectId: project.id } },
      update: {},
      create: {
        externalId: `BUG-${i + 1}`,
        projectId: project.id,
        title: defectTitles[i],
        status: isResolved ? 'Resolved' : i % 3 === 0 ? 'In Progress' : 'Open',
        severity,
        priority: severity === 'CRITICAL' ? 'Critical' : severity === 'HIGH' ? 'High' : 'Medium',
        assignee: ['alice@demo.com', 'bob@demo.com', 'carol@demo.com'][i % 3],
        linkedTestKey: i < 10 ? `TC-${i + 1}` : undefined,
        components: ['frontend', 'backend'],
        labels: ['defect'],
        syncedAt: isoDate(i * 2),
        resolvedAt: isResolved ? isoDate(i) : null,
      },
    })
  }
  console.log('Created 20 defects')

  // Create SyncRun record
  await prisma.syncRun.create({
    data: {
      projectId: project.id,
      status: 'SUCCESS',
      startedAt: isoDate(0),
      completedAt: new Date(),
      itemsSynced: requirementIds.length + testCaseIds.length + 130 + 20,
      isIncremental: false,
      stages: {
        requirements: { status: 'success', count: requirementIds.length },
        testCases: { status: 'success', count: testCaseIds.length },
        executions: { status: 'success', count: 130 },
        defects: { status: 'success', count: 20 },
      },
    },
  })
  console.log('Created SyncRun record')

  // Generate 30-day KPI history
  console.log('Generating 30-day KPI history...')
  const weights = {
    coverageRate: 0.25,
    executionProgress: 0.20,
    passRate: 0.25,
    automationRate: 0.10,
    defectPressure: 0.20,
  }

  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const snapshotAt = isoDate(daysAgo)
    const progress = (29 - daysAgo) / 29

    const coverageRate = 0.70 + progress * 0.11
    const executionProgress = 0.75 + progress * 0.125
    const passRate = 0.78 + progress * 0.04
    const automationRate = 0.22 + progress * 0.06
    const defectPressureScore = 0.55 + progress * 0.10
    const flakyRate = 0.07 - progress * 0.02

    const readinessScore =
      coverageRate * weights.coverageRate * 100 +
      executionProgress * weights.executionProgress * 100 +
      passRate * weights.passRate * 100 +
      automationRate * weights.automationRate * 100 +
      defectPressureScore * weights.defectPressure * 100

    const readinessTier =
      readinessScore >= 75 ? 'GREEN' : readinessScore >= 50 ? 'AMBER' : 'RED'

    // Compute integer counts from rates
    const totalRequirements = 80
    const coveredRequirements = Math.round(totalRequirements * coverageRate)
    const totalPlanned = 130
    const totalExecuted = Math.round(totalPlanned * executionProgress)
    const totalPassed = Math.round(totalExecuted * passRate)
    const totalTests = 180
    const automatedTests = Math.round(totalTests * automationRate)
    const flakyTestCount = Math.round(totalTests * flakyRate)

    await prisma.kpiSnapshot.create({
      data: {
        projectId: project.id,
        snapshotAt,
        totalRequirements,
        coveredRequirements,
        coverageRate,
        totalPlanned,
        totalExecuted,
        executionProgress,
        totalPassed,
        passRate,
        totalTests,
        automatedTests,
        automationRate,
        openCritical: daysAgo > 15 ? 2 : 1,
        openHigh: daysAgo > 10 ? 5 : 3,
        openMedium: daysAgo > 5 ? 8 : 5,
        openLow: 3,
        openTrivial: 1,
        defectPressureScore,
        flakyTestCount,
        flakyRate,
        readinessScore,
        readinessTier: readinessTier as 'GREEN' | 'AMBER' | 'RED',
        weightsSnapshot: weights,
      },
    })
  }
  console.log('Generated 30-day KPI history')

  console.log('\nDemo seed complete!')
  console.log('Login with: demo@example.com / demo123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
