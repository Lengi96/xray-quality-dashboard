import {
  IProjectAdapter,
  FetchOptions,
  RawProject,
  RawRequirement,
  RawTestCase,
  RawTestPlan,
  RawTestSet,
  RawTestExecution,
  RawDefect,
  RawCoverageLink,
} from '../types'
import { MOCK_PROJECTS } from './fixtures/projects'
import { MOCK_REQUIREMENTS } from './fixtures/requirements'
import { MOCK_TEST_CASES } from './fixtures/test-cases'
import { MOCK_TEST_PLANS } from './fixtures/test-plans'
import { MOCK_TEST_SETS } from './fixtures/test-sets'
import { MOCK_EXECUTIONS } from './fixtures/executions'
import { MOCK_DEFECTS } from './fixtures/defects'
import { MOCK_COVERAGE_LINKS } from './fixtures/coverage-links'

export class MockAdapter implements IProjectAdapter {
  async healthCheck(): Promise<void> {
    // Mock is always healthy — no-op
  }

  async fetchProjects(): Promise<RawProject[]> {
    return MOCK_PROJECTS
  }

  async fetchRequirements(_opts: FetchOptions): Promise<RawRequirement[]> {
    return MOCK_REQUIREMENTS
  }

  async fetchTestCases(_opts: FetchOptions): Promise<RawTestCase[]> {
    return MOCK_TEST_CASES
  }

  async fetchTestPlans(_opts: FetchOptions): Promise<RawTestPlan[]> {
    return MOCK_TEST_PLANS
  }

  async fetchTestSets(_opts: FetchOptions): Promise<RawTestSet[]> {
    return MOCK_TEST_SETS
  }

  async fetchTestExecutions(_opts: FetchOptions): Promise<RawTestExecution[]> {
    return MOCK_EXECUTIONS
  }

  async fetchDefects(_opts: FetchOptions): Promise<RawDefect[]> {
    return MOCK_DEFECTS
  }

  async fetchCoverageLinks(_opts: FetchOptions): Promise<RawCoverageLink[]> {
    return MOCK_COVERAGE_LINKS
  }
}
