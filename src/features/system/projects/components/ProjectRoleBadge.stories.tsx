import type { Meta, StoryObj } from '@storybook/react'
import { ProjectRoleBadge } from './ProjectRoleBadge'

const meta = {
  title: 'Projects/Components/ProjectRoleBadge',
  component: ProjectRoleBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    role: {
      control: 'select',
      options: ['owner', 'admin', 'member', 'viewer', null],
      description: 'The role of the user in the project',
    },
    isOwner: {
      control: 'boolean',
      description: 'Whether the user is the project owner',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof ProjectRoleBadge>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The owner role has full control over the project, including deletion and team management.
 */
export const Owner: Story = {
  args: {
    role: null,
    isOwner: true,
  },
}

/**
 * Admin role can edit project, manage team, and update settings.
 */
export const Admin: Story = {
  args: {
    role: 'admin',
    isOwner: false,
  },
}

/**
 * Member role can edit project content, tasks, and milestones.
 */
export const Member: Story = {
  args: {
    role: 'member',
    isOwner: false,
  },
}

/**
 * Viewer role has read-only access to the project.
 */
export const Viewer: Story = {
  args: {
    role: 'viewer',
    isOwner: false,
  },
}

/**
 * When no role is provided and user is not owner, nothing is displayed.
 */
export const NoRole: Story = {
  args: {
    role: null,
    isOwner: false,
  },
}

/**
 * Owner role takes precedence even when another role is specified.
 */
export const OwnerOverridesRole: Story = {
  args: {
    role: 'member',
    isOwner: true,
  },
}
