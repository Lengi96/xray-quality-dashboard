# Test Coverage & Quality Dashboard — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready MVP web application that integrates with Jira and Xray to deliver a transparent Quality & Test Coverage Dashboard with KPI-driven release readiness scoring.

**Architecture:** Next.js 14 App Router application with a PostgreSQL/Prisma data layer, a clean adapter-based integration abstraction (Jira + Xray Cloud/Server + Mock), a KPI engine that calculates and snapshots metrics after every sync, and a professional dashboard UI with drill-down views.

**Tech Stack:** Next.js 14 (App Router), TypeScript, TailwindCSS, PostgreSQL, Prisma ORM, Recharts, NextAuth (CredentialsProvider), Zod, Jira REST API v3, Xray Cloud + Server/DC REST APIs.

---

## Context

This is a greenfield project in `D:\projects\Xray Addon`. The directory is completely empty. The goal is to build a consultant-grade internal quality management tool that can be demonstrated with mock data and connected to live Jira/Xray instances. The tool answers: "Are we ready to go live?"

---

## Folder Structure

```
xray-dashboard/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── docker-compose.yml
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # redirects to /dashboard
│   │   ├── (auth)/login/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                    # sidebar + nav shell
│   │   │   ├── dashboard/page.tsx            # executive overview
│   │   │   ├── coverage/page.tsx
│   │   │   ├── coverage/[requirementId]/page.tsx
│   │   │   ├── execution/page.tsx
│   │   │   ├── automation/page.tsx
│   │   │   ├── defects/page.tsx
│   │   │   ├── risk/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── projects/route.ts
│   │       ├── sync/route.ts
│   │       ├── sync/status/route.ts
│   │       ├── kpi/snapshot/route.ts
│   │       ├── kpi/history/route.ts
│   │       ├── coverage/route.ts
│   │       ├── execution/route.ts
│   │       ├── defects/route.ts
│   │       └── settings/route.ts
│   ├── components/
│   │   ├── ui/                               # card, badge, button, progress-bar, skeleton, traffic-light
│   │   ├── layout/                           # app-sidebar, header, page-header
│   │   ├── charts/                           # readiness-gauge, trend-line, coverage-donut, pass-fail-pie, defect-severity-bar
│   │   ├── dashboard/                        # readiness-score-card, kpi-health-card, sync-status-banner
│   │   ├── coverage/                         # coverage-summary, uncovered-requirements-table
│   │   ├── execution/                        # execution-summary, execution-results-table
│   │   ├── defects/                          # defect-breakdown-table
│   │   └── settings/                         # connection-config-form, sync-control-panel
│   ├── lib/
│   │   ├── prisma.ts                         # singleton Prisma client
│   │   ├── auth.ts                           # NextAuth config
│   │   ├── utils.ts                          # cn(), formatDate()
│   │   └── constants.ts                      # severity weights, score thresholds
│   ├── integrations/
│   │   ├── types.ts                          # IProjectAdapter interface + Raw* types
│   │   ├── factory.ts                        # returns correct adapter from config
│   │   ├── jira/client.ts + adapter.ts + transformers.ts
│   │   ├── xray/cloud/client.ts + adapter.ts + transformers.ts
│   │   ├── xray/server/client.ts + adapter.ts + transformers.ts
│   │   └── mock/adapter.ts + fixtures/(projects, requirements, test-cases, executions, defects).ts
│   ├── sync/
│   │   ├── pipeline.ts                       # orchestrator with stage ordering + partial failure handling
│   │   ├── normalizer.ts
│   │   └── stages/                           # sync-projects, sync-requirements, sync-test-cases, sync-test-plans, sync-executions, sync-defects, sync-coverage-links
│   ├── kpi/
│   │   ├── engine.ts                         # orchestrates all formulas, calls snapshot.ts
│   │   ├── snapshot.ts
│   │   └── formulas/                         # coverage-rate, execution-progress, pass-rate, automation-rate, defect-pressure, readiness-score
│   ├── server/queries/                       # projects, coverage, execution, defects, kpi (server-side DB queries)
│   └── types/
│       ├── domain.ts                         # canonical domain types
│       ├── api.ts                            # API request/response shapes
│       └── kpi.ts                            # KPI value types + score configs
```

---

## Prisma Schema (All Models)

**Models:** `User`, `Project`, `ProjectConfig`, `Requirement`, `TestCase`, `CoverageLink`, `TestPlan`, `TestSet`, `TestSetMember`, `TestExecution`, `Defect`, `SyncRun`, `KpiSnapshot`

**Key enums:** `Platform` (JIRA_CLOUD | JIRA_SERVER), `XrayType` (XRAY_CLOUD | XRAY_SERVER), `RequirementType` (EPIC | STORY | TASK), `TestType` (MANUAL | AUTOMATED | GENERIC), `ExecutionStatus` (PASS | FAIL | BLOCKED | TODO | EXECUTING | ABORTED), `DefectSeverity` (CRITICAL | HIGH | MEDIUM | LOW | TRIVIAL), `SyncStatus` (RUNNING | SUCCESS | PARTIAL | FAILED), `ReadinessTier` (RED | AMBER | GREEN)

**All models include:**
- `externalId` (Jira/Xray issue key) + `@@unique([externalId, projectId])`
- `syncedAt` DateTime
- `@@index` on `projectId`, status fields, and timestamp fields
- `KpiSnapshot` stores all KPI values as floats + `weightsSnapshot Json` for auditability
- `TestExecution` includes `isFlaky Boolean` and `flakyScore Float` computed during sync

---

## Integration Abstraction Pattern

Single `IProjectAdapter` interface in `src/integrations/types.ts`:
```typescript
interface IProjectAdapter {
  healthCheck(): Promise<void>
  fetchProjects(): Promise<RawProject[]>
  fetchRequirements(opts: FetchOptions): Promise<RawRequirement[]>
  fetchTestCases(opts: FetchOptions): Promise<RawTestCase[]>
  fetchTestPlans(opts: FetchOptions): Promise<RawTestPlan[]>
  fetchTestExecutions(opts: FetchOptions): Promise<RawTestExecution[]>
  fetchDefects(opts: FetchOptions): Promise<RawDefect[]>
  fetchCoverageLinks(opts: FetchOptions): Promise<RawCoverageLink[]>
}
```

Factory (`factory.ts`) returns `MockAdapter` when `DEMO_MODE=true` or per-project `useMock` flag is set. All three concrete adapters (JiraXrayCloud, JiraXrayServer, Mock) implement this interface identically. Sync pipeline and UI never import a concrete adapter.

**Transformers** are pure functions (e.g., `transformJiraIssueToRequirement`) with Zod validation on external API response shapes — independently testable and isolated from sync logic.

---

## KPI Formulas

| KPI | Formula |
|-----|---------|
| Coverage Rate | `covered_requirements / total_requirements` |
| Execution Progress | `executed (non-TODO) / planned (latest active test plan)` |
| Pass Rate | `PASS / all non-TODO executions` |
| Automation Rate | `AUTOMATED test cases / all test cases` |
| Defect Pressure | `1 - min(Σ(count × severity_weight) / normalizer, 1)` — inverted so higher = better |
| Flaky Rate | `flaky_tests / all executed` |
| **Readiness Score** | `(coverageRate×0.25 + executionProgress×0.20 + passRate×0.25 + automationRate×0.10 + defectPressure×0.20) × 100` |

**Traffic light thresholds:** GREEN ≥ 75, AMBER 50–74, RED < 50 (configurable per project in DB).

**Severity weights (constants.ts):** CRITICAL=10, HIGH=5, MEDIUM=2, LOW=1, TRIVIAL=0.5

**Flaky detection:** After each execution upsert, query last 10 executions for that test case. `flakyScore = transitions / (n-1)`. `isFlaky = score > 0.4`.

---

## Sync Pipeline

**Stage execution order** (FK dependency order):
1. `sync-projects` → 2. `sync-requirements` → 3. `sync-test-cases` → 4. `sync-test-plans` → 5. `sync-test-sets` → 6. `sync-coverage-links` → 7. `sync-executions` → 8. `sync-defects`

**Partial failure:** Each stage wraps in try/catch, returns `StageResult { status: 'done'|'error'|'skipped' }`. Pipeline continues on stage error (configurable). `SyncRun.status = PARTIAL` if any stage errored.

**Incremental sync:** `since = lastSuccessfulSyncRun.completedAt - 5min`. Each adapter uses `since` to filter by `updatedDate`. Full sync forces `since = undefined`.

**After pipeline completes:** KPI engine is called immediately → `KpiSnapshot` record written.

---

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| POST | `/api/sync` | Trigger full/incremental sync |
| GET | `/api/sync/status?projectId=` | Latest SyncRun status |
| GET | `/api/kpi/snapshot?projectId=` | Latest KpiSnapshot |
| GET | `/api/kpi/history?projectId=&days=30` | KpiSnapshot trend |
| GET | `/api/coverage?projectId=` | Coverage stats + uncovered list |
| GET | `/api/execution?projectId=&planId=` | Execution progress + results |
| GET | `/api/defects?projectId=&severity=&status=` | Defects with filters |
| GET/PUT | `/api/settings?projectId=` | Project config (credentials encrypted) |

All routes: validate with Zod, call `server/queries/` functions, return typed JSON. No business logic in routes.

---

## Dashboard Pages

| Page | Route | Key Components |
|------|-------|----------------|
| Executive Overview | `/dashboard` | ReadinessScoreGauge, 5× KpiHealthCard (with sparklines), TrendLine (30-day score history), SyncStatusBanner |
| Coverage | `/coverage` | CoverageDonut, stacked bar by type/priority, UncoveredRequirementsTable (paginated/sortable) |
| Coverage Drill-down | `/coverage/[id]` | Requirement detail + linked tests table |
| Execution | `/execution` | TestPlan selector, ExecutionProgressBar, PassFailPie, ExecutionResultsTable with flaky badge |
| Automation | `/automation` | AutomationRateDonut, automation by label/component grouped bar, gap table (manual tests sorted by run frequency) |
| Defects | `/defects` | Severity horizontal bar, age distribution, DefectBreakdownTable, inflow/outflow trend |
| Risk | `/risk` | Hotspot table (uncovered + defective requirements), flaky test list, blockers section (CRITICAL defects + FAIL on critical stories) |
| Settings | `/settings` | Connection config form, Test Connection button, sync history table, demo mode toggle, weight sliders |

---

## Mock / Demo Mode

**Activation:** `DEMO_MODE=true` in `.env` or per-project DB flag. Factory returns `MockAdapter`. No special UI code paths.

**Fixture data produces a realistic AMBER state (~68 readiness score):**
- 80 requirements (60 stories, 20 epics)
- 180 test cases (120 manual, 50 automated, 10 generic) → 28% automation rate
- 160 coverage links covering 65/80 requirements → 81% coverage
- 140 of 160 executions done; 115 PASS, 18 FAIL, 7 BLOCKED → 82% pass rate
- 22 open defects (2 CRITICAL, 5 HIGH, 8 MEDIUM, 7 LOW)
- 8 flaky tests

---

## Implementation Phases

### Phase 1: Project Scaffold + Database
**Files to create:** `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `.env.example`, `docker-compose.yml`, `prisma/schema.prisma`, `src/lib/prisma.ts`, `src/types/domain.ts`, `src/lib/constants.ts`

**Steps:**
1. `npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"` in `D:\projects\Xray Addon`
2. Install deps: `prisma @prisma/client next-auth recharts zod @auth/prisma-adapter`
3. Write full `prisma/schema.prisma` (all 13 models + enums)
4. Write `src/types/domain.ts` — canonical TypeScript interfaces mirroring Prisma models
5. Write `src/lib/constants.ts` — severity weights, thresholds, default KPI weights
6. `npx prisma migrate dev --name init`
7. Write `docker-compose.yml` for local Postgres

**Verify:** `npx prisma studio` shows all tables. `npm run dev` starts without errors.

---

### Phase 2: Auth + App Shell
**Files:** `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/(auth)/login/page.tsx`, `src/app/(dashboard)/layout.tsx`, all 7 stub dashboard pages, `src/components/ui/` primitives

**Steps:**
1. Add `User` + `Account` models to Prisma schema (NextAuth adapter needs them)
2. Configure `NextAuth` with `CredentialsProvider` + `PrismaAdapter`
3. Create login page with form (email + password)
4. Create `(dashboard)/layout.tsx` with `AppSidebar` (navigation links to all 7 pages)
5. Create stub pages for each dashboard route returning placeholder content
6. Create UI primitives: `card.tsx`, `badge.tsx`, `button.tsx`, `progress-bar.tsx`, `skeleton.tsx`, `traffic-light.tsx`, `spinner.tsx`

**Verify:** Login redirects to dashboard. Sidebar links navigate correctly. Auth guard works (unauthenticated → login).

---

### Phase 3: Integration Abstraction + Mock Adapter
**Files:** `src/integrations/types.ts`, `src/integrations/factory.ts`, `src/integrations/mock/adapter.ts`, `src/integrations/mock/fixtures/*.ts`

**Steps:**
1. Write `types.ts` — `IProjectAdapter` interface, all `Raw*` types, `FetchOptions`
2. Write fixture files with realistic data distributions (matching AMBER state above)
3. Write `MockAdapter` implementing all `IProjectAdapter` methods using fixtures
4. Write `factory.ts` — reads project config from DB, returns correct adapter
5. Write unit tests for MockAdapter (verify return shapes match Raw* interfaces)

**Verify:** `MockAdapter.fetchRequirements({ projectKey: 'DEMO' })` returns 60 stories + 20 epics with correct shape.

---

### Phase 4: Sync Pipeline
**Files:** `src/sync/pipeline.ts`, `src/sync/normalizer.ts`, `src/sync/stages/*.ts` (7 files), `src/app/api/sync/route.ts`, `src/app/api/sync/status/route.ts`

**Steps:**
1. Write `normalizer.ts` — maps Raw* types to Prisma upsert payloads
2. Write each stage file (dependency order: projects → requirements → test-cases → test-plans → coverage-links → executions → defects)
3. In `sync-executions.ts`: add flaky detection logic (check last 10 executions per test case, set `isFlaky` + `flakyScore`)
4. Write `pipeline.ts` — `SyncContext`, stage loop with try/catch, `SyncRun` creation and status updates
5. Write sync API routes

**Verify:** `POST /api/sync` with `DEMO_MODE=true` populates all tables. `SyncRun.status = SUCCESS`. Check counts in `prisma studio` match fixture expectations.

---

### Phase 5: KPI Engine
**Files:** `src/kpi/formulas/*.ts` (6 files), `src/kpi/engine.ts`, `src/kpi/snapshot.ts`, `src/server/queries/kpi.ts`, `src/app/api/kpi/snapshot/route.ts`, `src/app/api/kpi/history/route.ts`

**Steps:**
1. Write each formula file (pure async functions, take `projectId`, query DB, return typed result)
2. Write `engine.ts` — calls all formulas in parallel where independent, calls `snapshot.ts`
3. Write `snapshot.ts` — persists `KpiSnapshot` record to DB
4. Wire engine into end of `pipeline.ts`
5. Write `server/queries/kpi.ts` — `getLatestKpiSnapshot`, `getKpiHistory(projectId, days)`
6. Write API routes

**Verify:** After sync, `KpiSnapshot` row exists. `readinessScore ≈ 68`, `readinessTier = AMBER` for demo data.

---

### Phase 6: Executive Overview Page
**Files:** `src/components/charts/readiness-gauge.tsx`, `src/components/charts/trend-line.tsx`, `src/components/dashboard/*.tsx`, `src/app/(dashboard)/dashboard/page.tsx`

**Steps:**
1. Write `readiness-gauge.tsx` — Recharts `RadialBarChart` with score (0-100), tier color, tier label + icon
2. Write `trend-line.tsx` — Recharts `LineChart` for KpiSnapshot history (readinessScore over time)
3. Write `kpi-health-card.tsx` — card with current value, trend arrow, mini sparkline (Recharts `AreaChart`)
4. Write `readiness-score-card.tsx` — wraps gauge + per-KPI contribution breakdown table
5. Write `sync-status-banner.tsx` — last sync time, "Sync Now" button (client component with SWR)
6. Populate `dashboard/page.tsx` as Server Component — fetches snapshot + history from queries

**Verify:** `/dashboard` renders gauge showing ~68, AMBER tier, 5 health cards with correct values, 30-day trend.

---

### Phase 7: Coverage + Execution Pages
**Files:** `src/server/queries/coverage.ts`, `src/server/queries/execution.ts`, API routes, all coverage + execution components

**Steps:**
1. Write `server/queries/coverage.ts` — `getCoverageSummary`, `getUncoveredRequirements`, `getRequirementDetail`
2. Write `server/queries/execution.ts` — `getExecutionSummary`, `getExecutionResults`, `getTestPlans`
3. Write API routes for coverage + execution
4. Build Coverage page: `CoverageDonut` + `UncoveredRequirementsTable` (key, title, type, priority, epic — sortable, paginated)
5. Build `/coverage/[requirementId]` drill-down: requirement detail + linked tests table + linked execution results
6. Build Execution page: TestPlan dropdown, `ExecutionProgressBar`, `PassFailPie`, `ExecutionResultsTable` (with isFlaky badge)

**Verify:** Coverage page shows 81% donut. Clicking uncovered requirement shows detail. Execution page shows 140/160 executed, 82% pass rate.

---

### Phase 8: Automation + Defects + Risk Pages
**Files:** `src/server/queries/defects.ts`, API routes, all remaining page components

**Steps:**
1. Build Automation page: donut (28% automated), automation by component grouped bar, manual-test gap table sorted by execution frequency
2. Write `server/queries/defects.ts` — `getDefectSummary`, `getDefectList` with filters
3. Build Defects page: severity horizontal bar, DefectBreakdownTable (filterable by severity/status, sortable by age), inflow/outflow trend
4. Build Risk page: hotspot table (requirements: no tests AND open defects), flaky test list sorted by `flakyScore`, blockers section (CRITICAL defects + FAIL executions for critical stories)
5. Add `loading.tsx` skeleton screens to all route segments

**Verify:** All 6 pages render correctly with demo data. Defect counts match fixtures. Risk page shows 8 flaky tests.

---

### Phase 9: Real Jira + Xray Adapters + Settings Page
**Files:** All files in `src/integrations/jira/` and `src/integrations/xray/`, `src/app/(dashboard)/settings/page.tsx`, settings components, `src/app/api/settings/route.ts`

**Steps:**
1. Write `jira/client.ts` — Jira REST v3 fetch wrapper (Basic auth + Bearer token support, pagination via `startAt`/`maxResults`, Zod validation of responses)
2. Write `jira/transformers.ts` — `transformJiraIssueToRequirement`, `transformJiraIssueToBug`, etc.
3. Write `jira/adapter.ts` — implements `IProjectAdapter` using Jira client
4. Write `xray/cloud/client.ts + adapter.ts + transformers.ts` (Xray Cloud uses its own auth token separate from Jira)
5. Write `xray/server/client.ts + adapter.ts + transformers.ts` (Server/DC uses same Basic auth as Jira)
6. Add `ProjectConfig` model to Prisma schema: stores encrypted credentials (`aes-256-cbc` using `NEXTAUTH_SECRET` as key)
7. Build Settings page: connection config form (platform type, base URL, credentials, Xray type), "Test Connection" button (calls `healthCheck()`), sync history table, weight sliders, demo mode toggle

**Verify:** "Test Connection" succeeds against a real Jira Cloud sandbox. Settings save encrypted credentials. Toggle demo mode shows/hides mock data.

---

### Phase 10: Production Hardening + Documentation
**Files:** `error.tsx` boundaries, Zod validation in all routes, `README.md`, `SECURITY.md`

**Steps:**
1. Add `error.tsx` and `not-found.tsx` to all route segments
2. Add Zod schemas for all API route inputs; return typed error responses
3. Remove all `console.log` statements; ensure no credential values are logged
4. Create demo seed script: `npx ts-node scripts/seed-demo.ts` — creates demo User + Project, runs mock sync, produces 30-day KpiSnapshot history
5. Write `README.md` (project purpose, setup, env vars, docker-compose, demo mode, KPI definitions)
6. Write `SECURITY.md` (credential storage approach, no-log policy)
7. Final review: all pages have loading states, empty states, and error states

**Verify:** `docker-compose up` starts app + DB. Demo seed produces a navigable dashboard. `DEMO_MODE=true` shows AMBER state with ~68 readiness score.

---

## Critical Files (in implementation order)

1. `prisma/schema.prisma` — foundation; everything depends on this
2. `src/types/domain.ts` — canonical types used everywhere
3. `src/lib/constants.ts` — KPI weights and thresholds
4. `src/integrations/types.ts` — `IProjectAdapter` contract
5. `src/integrations/mock/adapter.ts` — enables demo mode from day 1
6. `src/sync/pipeline.ts` — core data pipeline
7. `src/kpi/engine.ts` — KPI orchestrator
8. `src/app/(dashboard)/dashboard/page.tsx` — primary user-facing output

---

## Environment Variables (.env.example)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/xray_dashboard"

# Auth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Demo mode (set to true to use mock data, no Jira/Xray required)
DEMO_MODE="true"

# Jira (optional - configure per-project in Settings UI instead)
JIRA_BASE_URL=""
JIRA_EMAIL=""
JIRA_API_TOKEN=""

# Xray Cloud (optional)
XRAY_CLIENT_ID=""
XRAY_CLIENT_SECRET=""
```

---

## Verification (End-to-End)

1. `docker-compose up -d` → Postgres starts
2. `npm run dev` → app starts on :3000
3. `npx prisma migrate dev` → all tables created
4. `npx ts-node scripts/seed-demo.ts` → demo data populated
5. Navigate to `http://localhost:3000` → redirected to login
6. Login with demo credentials → dashboard shows AMBER readiness score ~68
7. Click through all 6 dashboard pages — all show charts and tables with data
8. Navigate to Settings → toggle demo mode off → configure real Jira credentials → "Test Connection" → "Sync Now" → real data populates

---

## Execution Options

**Subagent-Driven (this session):** Dispatch a fresh subagent per phase, review between phases.

**Parallel Session (separate):** Open new session in worktree and use `superpowers:executing-plans`.
