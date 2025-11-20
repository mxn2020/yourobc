import { test, expect } from '@playwright/test'

test.describe('Project Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
  })

  test('should edit an existing project', async ({ page }) => {
    // Click on first project in list
    await page.click('[data-testid="project-card"]:first-child, tr[data-testid="project-row"]:first-child')

    // Wait for project details to load
    await page.waitForSelector('button:has-text("Edit")', { timeout: 5000 })

    // Click edit button
    await page.click('button:has-text("Edit")')

    // Update project title
    const updatedTitle = `Updated Project ${Date.now()}`
    await page.fill('input[name="title"]', updatedTitle)

    // Update description
    await page.fill('textarea[name="description"]', 'Updated description')

    // Save changes
    await page.click('button[type="submit"]:has-text("Save")')

    // Verify changes were saved
    await expect(page.locator('h1, h2')).toContainText(updatedTitle)
    await expect(page.locator('text=Updated description')).toBeVisible()
  })

  test('should filter projects by status', async ({ page }) => {
    // Open filter dropdown
    await page.click('[data-testid="filter-status"], button:has-text("Filter")')

    // Select "Active" status
    await page.click('text=Active')

    // Wait for filtered results
    await page.waitForTimeout(500)

    // Verify only active projects are shown
    const projectCards = page.locator('[data-testid="project-card"], [data-testid="project-row"]')
    const count = await projectCards.count()

    if (count > 0) {
      // Check that all visible projects have active status
      for (let i = 0; i < count; i++) {
        await expect(projectCards.nth(i)).toContainText(/active/i)
      }
    }
  })

  test('should search for projects', async ({ page }) => {
    // Type in search box
    await page.fill('input[type="search"], input[placeholder*="search" i]', 'test')

    // Wait for search results
    await page.waitForTimeout(500)

    // Verify search results contain the search term
    const projectTitles = page.locator('[data-testid="project-title"], [data-testid="project-card"] h3')
    const count = await projectTitles.count()

    if (count > 0) {
      const firstTitle = await projectTitles.first().textContent()
      expect(firstTitle?.toLowerCase()).toContain('test')
    }
  })

  test('should toggle between grid and list view', async ({ page }) => {
    // Click grid view button
    await page.click('[data-testid="view-grid"], button[aria-label*="grid" i]')
    await page.waitForTimeout(300)

    // Verify grid layout is active
    await expect(page.locator('[data-testid="projects-grid"]')).toBeVisible()

    // Click list view button
    await page.click('[data-testid="view-list"], button[aria-label*="list" i]')
    await page.waitForTimeout(300)

    // Verify list layout is active
    await expect(page.locator('[data-testid="projects-table"], table')).toBeVisible()
  })

  test('should navigate to project details', async ({ page }) => {
    // Click on a project
    await page.click('[data-testid="project-card"]:first-child, tr[data-testid="project-row"]:first-child')

    // Verify we're on project details page
    await expect(page).toHaveURL(/\/projects\/[a-zA-Z0-9]+/)

    // Verify project details are visible
    await expect(page.locator('h1, h2')).toBeVisible()
    await expect(page.locator('text=/overview|details/i')).toBeVisible()
  })

  test('should view project analytics', async ({ page }) => {
    // Click on a project
    await page.click('[data-testid="project-card"]:first-child, tr[data-testid="project-row"]:first-child')

    // Navigate to analytics tab
    await page.click('button:has-text("Analytics"), [role="tab"]:has-text("Analytics")')

    // Wait for analytics to load
    await page.waitForTimeout(500)

    // Verify analytics content is visible
    await expect(
      page.locator('text=/health score|completion rate|progress/i')
    ).toBeVisible()
  })

  test('should delete a project', async ({ page }) => {
    // Click on a project
    await page.click('[data-testid="project-card"]:first-child, tr[data-testid="project-row"]:first-child')

    // Click delete button
    await page.click('button:has-text("Delete")')

    // Confirm deletion in dialog
    await page.click('button:has-text("Confirm"), button:has-text("Delete"):last-child')

    // Verify redirect to projects list
    await expect(page).toHaveURL(/\/projects\/?$/)
  })

  test('should update project status', async ({ page }) => {
    // Click on a project
    await page.click('[data-testid="project-card"]:first-child, tr[data-testid="project-row"]:first-child')

    // Click status dropdown
    await page.click('[data-testid="status-select"]')

    // Select new status
    await page.click('text=Completed')

    // Wait for update
    await page.waitForTimeout(500)

    // Verify status was updated
    await expect(page.locator('text=Completed')).toBeVisible()
  })

  test('should update project progress', async ({ page }) => {
    // Click on a project
    await page.click('[data-testid="project-card"]:first-child, tr[data-testid="project-row"]:first-child')

    // Find progress slider or input
    const progressInput = page.locator('input[type="range"], input[name*="progress"]')

    if (await progressInput.isVisible()) {
      // Update progress to 75%
      await progressInput.fill('75')

      // Wait for update
      await page.waitForTimeout(500)

      // Verify progress indicator shows 75%
      await expect(page.locator('text=75%')).toBeVisible()
    }
  })
})
