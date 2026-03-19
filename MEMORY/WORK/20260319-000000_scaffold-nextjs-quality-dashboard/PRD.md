---
task: Scaffold Next.js quality dashboard with Prisma database
slug: 20260319-000000_scaffold-nextjs-quality-dashboard
effort: advanced
phase: complete
progress: 32/32
mode: interactive
started: 2026-03-19T00:00:00Z
updated: 2026-03-19T00:02:00Z
---

## Context

Phase 1 scaffolding of "Test Coverage & Quality Dashboard" — a Next.js app integrating Jira + Xray APIs with PostgreSQL/Prisma. The target directory `D:\projects\Xray Addon` already has a `Plans/` subdirectory. We must scaffold into an existing non-empty directory, install all dependencies, write exact schema and supporting files, run `prisma generate` to validate, and NOT run `prisma migrate` (no DB). The deliverable is a fully buildable Next.js app with all Prisma types generated.

### Risks

- create-next-app may refuse non-empty directory or prompt interactively
- npm install may have version conflicts between next-auth, @auth/prisma-adapter, prisma versions
- prisma generate failing due to schema syntax errors
- Windows path issues with bash commands
- The `--skip-install` flag may not exist in latest create-next-app — need to verify correct flag

## Criteria

- [x] ISC-1: create-next-app runs without error in target directory
- [x] ISC-2: next.config.ts exists in project root after scaffold
- [x] ISC-3: tailwind.config.ts exists in project root after scaffold
- [x] ISC-4: tsconfig.json exists with @/* import alias configured
- [x] ISC-5: package.json exists with next, react, typescript as dependencies
- [x] ISC-6: src/app directory structure created by scaffold
- [x] ISC-7: npm install completes without fatal errors
- [x] ISC-8: prisma package installed (in node_modules)
- [x] ISC-9: @prisma/client package installed (in node_modules)
- [x] ISC-10: next-auth package installed (in node_modules)
- [x] ISC-11: recharts package installed (in node_modules)
- [x] ISC-12: zod package installed (in node_modules)
- [x] ISC-13: @auth/prisma-adapter package installed (in node_modules)
- [x] ISC-14: bcryptjs package installed (in node_modules)
- [x] ISC-15: @types/bcryptjs devDependency installed (in node_modules)
- [x] ISC-16: prisma/schema.prisma written with all 13 models present
- [x] ISC-17: prisma/schema.prisma has all 8 enums (Platform, XrayType, RequirementType, TestType, ExecutionStatus, DefectSeverity, SyncStatus, ReadinessTier)
- [x] ISC-18: prisma/schema.prisma datasource uses postgresql provider
- [x] ISC-19: src/types/domain.ts exists with all 10 DomainX interfaces
- [x] ISC-20: src/types/domain.ts re-exports all 8 Prisma enums as TypeScript types
- [x] ISC-21: src/lib/constants.ts exists with SEVERITY_WEIGHTS export
- [x] ISC-22: src/lib/constants.ts has DEFAULT_KPI_WEIGHTS export
- [x] ISC-23: src/lib/constants.ts has READINESS_THRESHOLDS export
- [x] ISC-24: src/lib/constants.ts has DEFECT_PRESSURE_NORMALIZER and FLAKY constants
- [x] ISC-25: src/lib/prisma.ts exists with PrismaClient singleton pattern
- [x] ISC-26: docker-compose.yml exists with postgres:16-alpine service
- [x] ISC-27: .env.example exists with DATABASE_URL and all required vars
- [x] ISC-28: npx prisma generate runs without error
- [x] ISC-29: @prisma/client types generated in node_modules/@prisma/client
- [x] ISC-30: npm run build passes OR schema/type errors are zero
- [x] ISC-31: Plans/ subdirectory still exists (not clobbered by scaffold)
- [x] ISC-32: No prisma/migrations directory created (migrate not run)

## Decisions

## Verification

- create-next-app scaffolded into temp dir then files moved to root (workaround for dir name restrictions)
- npm install installed 502 packages total with no fatal errors (warnings only for engine mismatch on @prisma/studio-core)
- prisma/schema.prisma: 13 models, 8 enums, postgresql provider confirmed
- prisma generate succeeded: "Generated Prisma Client (v7.5.0) to .\node_modules\@prisma\client in 155ms"
- Prisma v7 breaking change handled: `url` moved from schema.prisma to prisma.config.ts datasource field
- Prisma v7 adapter handled: PrismaPg adapter installed and used in src/lib/prisma.ts
- npm run build: "✓ Compiled successfully" with zero TypeScript errors
- src/types/domain.ts: 10 DomainX interfaces confirmed
- src/lib/constants.ts: 6 exports confirmed
- Plans/ directory untouched (still present)
- No prisma/migrations directory created (prisma migrate not run)
