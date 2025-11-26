# Projects Feature Testing Guide

This guide covers all testing approaches for the Projects feature, including unit tests, E2E tests, Storybook documentation, and performance monitoring.

## Table of Contents

- [Unit Tests](#unit-tests)
- [E2E Tests](#e2e-tests)
- [Storybook](#storybook)
- [Performance Monitoring](#performance-monitoring)
- [Running Tests](#running-tests)

## Unit Tests

### Overview

Unit tests for the Projects feature are written using Vitest and focus on pure utility functions in `utils/projectHelpers.ts`.

### Location

```
src/features/projects/utils/projectHelpers.test.ts
```

### What's Tested

1. **calculateProjectHealth** - Project health scoring algorithm
   - Health calculation based on status, progress, and due dates
   - Edge cases (cancelled projects, overdue projects, completed projects)
   - Score clamping (0-100 range)

2. **validateProjectData** - Input validation
   - Required field validation
   - Length constraints (title, description)
   - Date range validation
   - Tag limits
   - Metadata validation (budget, hours)

3. **isProjectOverdue** - Overdue detection
   - Active overdue projects
   - Completed projects (should not be overdue)
   - Projects without due dates

4. **getDaysUntilDue** - Due date calculations
   - Future dates (positive days)
   - Past dates (negative days)
   - Partial day rounding

5. **getProjectStatusColor** - Status color mapping
   - Known statuses (active, completed, on_hold, cancelled)
   - Unknown statuses (default to gray)

6. **getProjectPriorityColor** - Priority color mapping
   - All priority levels (low, medium, high, urgent, critical)
   - Unknown priorities (default to gray)

### Example Test

```typescript
it('should return excellent health for a project with high progress and no issues', () => {
  const project = {
    status: 'active',
    progress: { percentage: 95 },
    dueDate: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days from now
  }

  const result = calculateProjectHealth(project)

  expect(result.health).toBe('excellent')
  expect(result.score).toBeGreaterThanOrEqual(80)
})
```

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run only projects tests
npm test -- src/features/projects

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

## E2E Tests

### Overview

End-to-end tests are written using Playwright and cover critical user flows for the Projects feature.

### Location

```
e2e/projects/
  ├── project-creation.spec.ts     # Project creation flows
  ├── project-management.spec.ts   # Project CRUD operations
  └── task-management.spec.ts      # Task management flows
```

### Test Suites

#### 1. Project Creation (`project-creation.spec.ts`)

Tests the complete project creation flow:

- Creating projects with basic information
- Form validation (required fields, length limits)
- Adding dates and tags
- Form cancellation
- Date range validation

**Key Tests:**
```typescript
test('should create a new project with basic information', async ({ page }) => {
  await page.goto('/projects')
  await page.click('button:has-text("Create Project")')
  await page.fill('input[name="title"]', 'Test Project')
  await page.fill('textarea[name="description"]', 'Description')
  await page.click('button[type="submit"]:has-text("Create")')

  await expect(page).toHaveURL(/\/projects\/.*/)
})
```

#### 2. Project Management (`project-management.spec.ts`)

Tests project viewing and management:

- Editing existing projects
- Filtering by status
- Searching projects
- Grid/list view toggle
- Project navigation
- Analytics viewing
- Project deletion
- Status updates
- Progress updates

**Key Tests:**
```typescript
test('should edit an existing project', async ({ page }) => {
  await page.goto('/projects')
  await page.click('[data-testid="project-card"]:first-child')
  await page.click('button:has-text("Edit")')

  const updatedTitle = `Updated Project ${Date.now()}`
  await page.fill('input[name="title"]', updatedTitle)
  await page.click('button[type="submit"]:has-text("Save")')

  await expect(page.locator('h1, h2')).toContainText(updatedTitle)
})
```

#### 3. Task Management (`task-management.spec.ts`)

Tests task operations within projects:

- Creating tasks
- Marking tasks complete
- Editing tasks
- Deleting tasks
- Filtering tasks
- Assigning tasks to team members
- Setting due dates
- Drag-and-drop reordering

**Key Tests:**
```typescript
test('should create a new task', async ({ page }) => {
  await page.goto('/projects')
  await page.click('[data-testid="project-card"]:first-child')
  await page.click('button:has-text("Tasks")')
  await page.click('button:has-text("Add Task")')

  await page.fill('input[name="title"]', 'Test Task')
  await page.click('button[type="submit"]:has-text("Create")')

  await expect(page.locator('text=Test Task')).toBeVisible()
})
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### E2E Test Configuration

Configure Playwright in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
  ],
})
```

## Storybook

### Overview

Storybook provides interactive documentation and visual testing for UI components.

### Location

```
src/features/projects/components/
  ├── ProjectRoleBadge.stories.tsx
  └── ProjectStats.stories.tsx
```

### Stories

#### 1. ProjectRoleBadge

Demonstrates all role badge variations:

- Owner
- Admin
- Member
- Viewer
- No role
- Owner overrides role

**Example Story:**
```typescript
export const Owner: Story = {
  args: {
    role: null,
    isOwner: true,
  },
}
```

#### 2. ProjectStats

Shows statistics dashboard in different states:

- Default portfolio
- Loading state
- Healthy portfolio (high completion)
- Critical portfolio (many overdue)
- Empty state
- High completion rate

**Example Story:**
```typescript
export const HealthyPortfolio: Story = {
  args: {
    stats: {
      totalProjects: 25,
      completedProjects: 7,
      averageProgress: 85,
      overdueProjects: 0,
      // ... more stats
    },
    isLoading: false,
  },
}
```

### Running Storybook

```bash
# Start Storybook dev server
npm run storybook

# Build Storybook for deployment
npm run storybook:build
```

Then open http://localhost:6006

## Performance Monitoring

### Overview

Performance monitoring tracks SSR cache hit rates, query performance, and errors for the Projects feature.

### Setup

The performance monitoring addon is integrated into the Projects feature via:

```
src/features/projects/integrations/performance-monitoring.ts
```

### Key Metrics Tracked

1. **SSR Cache Performance**
   - Cache hit rate
   - Average hit time
   - Average miss time
   - Total requests

2. **Query Performance**
   - Query execution count
   - Average duration
   - Min/max duration
   - Error count
   - Cache status

3. **Errors**
   - Error type
   - Occurrence count
   - Affected users
   - First/last seen timestamps

### Using Performance Monitoring

#### Track SSR Cache

```typescript
import { trackProjectQueryCache } from '../integrations/performance-monitoring'

// In route loader
export const loader = async (context) => {
  const startTime = performance.now()
  const data = await fetchProjects()
  const duration = performance.now() - startTime

  trackProjectQueryCache('projects:list', true, duration)

  context.queryClient.setQueryData(['projects', 'list'], data)
}
```

#### Use Monitored Queries

```typescript
import { useMonitoredQuery } from '@/features/system/performance-monitoring/integrations/useMonitoredQuery'

function useProjects() {
  return useMonitoredQuery({
    queryKey: ['projects', 'list'],
    queryFn: fetchProjects,
  })
}
```

#### View Dashboard

Add the performance dashboard to your app:

```typescript
import { PerformanceDashboard } from '@/features/system/performance-monitoring'

function PerformancePage() {
  return <PerformanceDashboard timeRange={24 * 60 * 60 * 1000} />
}
```

### Performance Targets

- **Cache Hit Rate**: > 80%
- **Average Query Time**: < 100ms for cached, < 500ms for uncached
- **Error Rate**: < 1%
- **Overall Score**: > 90 (excellent), > 70 (good)

## Running All Tests

### Complete Test Suite

```bash
# Run all tests
npm test && npm run test:e2e

# Run with coverage
npm run test:coverage

# Start Storybook
npm run storybook
```

### CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run Unit Tests
  run: npm test -- --run

- name: Run E2E Tests
  run: npm run test:e2e

- name: Build Storybook
  run: npm run storybook:build
```

## Test Data

### Mock Project Data

Use consistent test data for predictable tests:

```typescript
const mockProject = {
  _id: 'test-project-1',
  title: 'Test Project',
  description: 'A test project',
  status: 'active',
  priority: 'high',
  progress: { percentage: 50 },
  dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
  startDate: Date.now(),
  tags: ['testing', 'automation'],
}
```

### Test User Authentication

E2E tests should handle authentication:

```typescript
test.beforeEach(async ({ page }) => {
  // Login before each test
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await page.waitForURL('/projects')
})
```

## Best Practices

1. **Unit Tests**
   - Test pure functions in isolation
   - Use meaningful test descriptions
   - Cover edge cases and error paths
   - Mock external dependencies

2. **E2E Tests**
   - Test critical user flows
   - Use data-testid attributes for stability
   - Handle loading states and transitions
   - Clean up test data after tests

3. **Storybook**
   - Document all component variations
   - Include edge cases (empty, loading, error)
   - Add descriptions and comments
   - Use realistic data

4. **Performance Monitoring**
   - Track all SSR prefetch operations
   - Monitor cache hit rates regularly
   - Set up alerts for performance degradation
   - Export metrics for analysis

## Troubleshooting

### Unit Tests Failing

- Check that dependencies are installed
- Verify test data is correct
- Check for timing issues (use vi.useFakeTimers())

### E2E Tests Flaky

- Add explicit waits for network/UI
- Use data-testid instead of text selectors
- Handle loading states properly
- Increase timeouts for slow operations

### Storybook Not Loading

- Check that CSS is imported in preview.tsx
- Verify component imports are correct
- Check for missing dependencies

### Performance Metrics Not Tracking

- Verify monitoring is enabled
- Check sampleRate configuration
- Ensure tracking methods are called
- Check browser console for errors

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Storybook Documentation](https://storybook.js.org/)
- [Performance Monitoring README](../../performance-monitoring/README.md)
