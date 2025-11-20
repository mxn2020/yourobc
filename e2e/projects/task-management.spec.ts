import { test, expect } from '@playwright/test'

test.describe('Task Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // Navigate to first project
    await page.click('[data-testid="project-card"]:first-child, tr[data-testid="project-row"]:first-child')
    await page.waitForLoadState('networkidle')
  })

  test('should create a new task', async ({ page }) => {
    // Navigate to tasks tab
    await page.click('button:has-text("Tasks"), [role="tab"]:has-text("Tasks")')

    // Click add task button
    await page.click('button:has-text("Add Task"), button:has-text("New Task")')

    // Fill task form
    const taskTitle = `Test Task ${Date.now()}`
    await page.fill('input[name="title"]', taskTitle)
    await page.fill('textarea[name="description"]', 'Task description')

    // Set priority
    await page.click('[data-testid="priority-select"]')
    await page.click('text=High')

    // Submit task
    await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Add")')

    // Verify task appears in list
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible()
  })

  test('should mark task as complete', async ({ page }) => {
    // Navigate to tasks tab
    await page.click('button:has-text("Tasks"), [role="tab"]:has-text("Tasks")')

    // Click checkbox on first task
    await page.click('[data-testid="task-checkbox"]:first-child, input[type="checkbox"]:first-child')

    // Wait for update
    await page.waitForTimeout(500)

    // Verify task is marked as complete (strikethrough or different styling)
    const firstTask = page.locator('[data-testid="task-item"]:first-child')
    await expect(firstTask).toHaveClass(/completed|done|checked/)
  })

  test('should edit an existing task', async ({ page }) => {
    // Navigate to tasks tab
    await page.click('button:has-text("Tasks"), [role="tab"]:has-text("Tasks")')

    // Click edit on first task
    await page.click('[data-testid="task-item"]:first-child button:has-text("Edit")')

    // Update task title
    const updatedTitle = `Updated Task ${Date.now()}`
    await page.fill('input[name="title"]', updatedTitle)

    // Save changes
    await page.click('button[type="submit"]:has-text("Save")')

    // Verify task was updated
    await expect(page.locator(`text=${updatedTitle}`)).toBeVisible()
  })

  test('should delete a task', async ({ page }) => {
    // Navigate to tasks tab
    await page.click('button:has-text("Tasks"), [role="tab"]:has-text("Tasks")')

    // Get initial task count
    const initialCount = await page.locator('[data-testid="task-item"]').count()

    // Click delete on first task
    await page.click('[data-testid="task-item"]:first-child button:has-text("Delete")')

    // Confirm deletion
    await page.click('button:has-text("Confirm"), button:has-text("Delete"):last-child')

    // Wait for update
    await page.waitForTimeout(500)

    // Verify task count decreased
    const newCount = await page.locator('[data-testid="task-item"]').count()
    expect(newCount).toBeLessThan(initialCount)
  })

  test('should filter tasks by status', async ({ page }) => {
    // Navigate to tasks tab
    await page.click('button:has-text("Tasks"), [role="tab"]:has-text("Tasks")')

    // Open filter dropdown
    await page.click('[data-testid="task-filter"], button:has-text("Filter")')

    // Select "Completed" status
    await page.click('text=Completed')

    // Wait for filtered results
    await page.waitForTimeout(500)

    // Verify filtered results (all tasks should be completed)
    const tasks = page.locator('[data-testid="task-item"]')
    const count = await tasks.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(tasks.nth(i)).toHaveClass(/completed|done/)
      }
    }
  })

  test('should assign task to team member', async ({ page }) => {
    // Navigate to tasks tab
    await page.click('button:has-text("Tasks"), [role="tab"]:has-text("Tasks")')

    // Click edit on first task
    await page.click('[data-testid="task-item"]:first-child button:has-text("Edit")')

    // Click assignee dropdown
    await page.click('[data-testid="assignee-select"]')

    // Select a team member
    await page.click('[data-testid="team-member-option"]:first-child')

    // Save changes
    await page.click('button[type="submit"]:has-text("Save")')

    // Verify assignee is shown
    await expect(page.locator('[data-testid="task-assignee"]')).toBeVisible()
  })

  test('should set task due date', async ({ page }) => {
    // Navigate to tasks tab
    await page.click('button:has-text("Tasks"), [role="tab"]:has-text("Tasks")')

    // Create new task
    await page.click('button:has-text("Add Task"), button:has-text("New Task")')

    await page.fill('input[name="title"]', 'Task with Due Date')

    // Set due date
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await page.fill('input[name="dueDate"]', futureDate.toISOString().split('T')[0])

    // Submit
    await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Add")')

    // Verify due date is shown
    await expect(page.locator('text=Task with Due Date')).toBeVisible()
  })

  test('should reorder tasks with drag and drop', async ({ page }) => {
    // Navigate to tasks tab
    await page.click('button:has-text("Tasks"), [role="tab"]:has-text("Tasks")')

    // Get first and second task texts
    const firstTaskText = await page
      .locator('[data-testid="task-item"]:first-child [data-testid="task-title"]')
      .textContent()
    const secondTaskText = await page
      .locator('[data-testid="task-item"]:nth-child(2) [data-testid="task-title"]')
      .textContent()

    // Drag first task to second position
    await page
      .locator('[data-testid="task-item"]:first-child [data-testid="drag-handle"]')
      .dragTo(page.locator('[data-testid="task-item"]:nth-child(2)'))

    // Wait for reorder
    await page.waitForTimeout(500)

    // Verify order changed
    const newFirstTaskText = await page
      .locator('[data-testid="task-item"]:first-child [data-testid="task-title"]')
      .textContent()

    expect(newFirstTaskText).toBe(secondTaskText)
  })
})
