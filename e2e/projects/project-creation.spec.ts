import { test, expect } from '@playwright/test'

test.describe('Project Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to projects page and ensure user is authenticated
    await page.goto('/projects')
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('should create a new project with basic information', async ({ page }) => {
    // Click create project button
    await page.click('button:has-text("Create Project"), button:has-text("New Project")')

    // Fill in project form
    await page.fill('input[name="title"]', 'Test Project')
    await page.fill('textarea[name="description"]', 'This is a test project description')

    // Select status
    await page.click('[data-testid="status-select"]')
    await page.click('text=Active')

    // Select priority
    await page.click('[data-testid="priority-select"]')
    await page.click('text=High')

    // Submit form
    await page.click('button[type="submit"]:has-text("Create")')

    // Verify project was created
    await expect(page).toHaveURL(/\/projects\/.*/)
    await expect(page.locator('h1, h2')).toContainText('Test Project')
  })

  test('should validate required fields', async ({ page }) => {
    // Click create project button
    await page.click('button:has-text("Create Project"), button:has-text("New Project")')

    // Try to submit without filling required fields
    await page.click('button[type="submit"]:has-text("Create")')

    // Verify validation errors appear
    await expect(page.locator('text=/required|cannot be empty/i')).toBeVisible()
  })

  test('should create project with dates and tags', async ({ page }) => {
    await page.click('button:has-text("Create Project"), button:has-text("New Project")')

    // Fill basic info
    await page.fill('input[name="title"]', 'Project with Details')
    await page.fill('textarea[name="description"]', 'Detailed project')

    // Set dates
    const today = new Date()
    const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    await page.fill('input[name="startDate"]', today.toISOString().split('T')[0])
    await page.fill('input[name="dueDate"]', futureDate.toISOString().split('T')[0])

    // Add tags
    await page.fill('input[name="tags"]', 'tag1')
    await page.keyboard.press('Enter')
    await page.fill('input[name="tags"]', 'tag2')
    await page.keyboard.press('Enter')

    // Submit
    await page.click('button[type="submit"]:has-text("Create")')

    // Verify details are shown
    await expect(page.locator('text=tag1')).toBeVisible()
    await expect(page.locator('text=tag2')).toBeVisible()
  })

  test('should handle form cancellation', async ({ page }) => {
    await page.click('button:has-text("Create Project"), button:has-text("New Project")')

    // Fill some data
    await page.fill('input[name="title"]', 'Cancelled Project')

    // Cancel form
    await page.click('button:has-text("Cancel")')

    // Verify we're back on projects list
    await expect(page).toHaveURL(/\/projects\/?$/)
  })

  test('should validate title length', async ({ page }) => {
    await page.click('button:has-text("Create Project"), button:has-text("New Project")')

    // Try to enter title longer than 100 characters
    const longTitle = 'a'.repeat(101)
    await page.fill('input[name="title"]', longTitle)
    await page.click('button[type="submit"]:has-text("Create")')

    // Verify validation error
    await expect(page.locator('text=/less than 100 characters/i')).toBeVisible()
  })

  test('should validate date range', async ({ page }) => {
    await page.click('button:has-text("Create Project"), button:has-text("New Project")')

    await page.fill('input[name="title"]', 'Date Validation Test')

    // Set start date after due date
    const today = new Date()
    const pastDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    await page.fill('input[name="startDate"]', today.toISOString().split('T')[0])
    await page.fill('input[name="dueDate"]', pastDate.toISOString().split('T')[0])

    await page.click('button[type="submit"]:has-text("Create")')

    // Verify validation error
    await expect(page.locator('text=/start date.*after.*due date/i')).toBeVisible()
  })
})
