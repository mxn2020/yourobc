# Website Builder Addon

A comprehensive modular website system for building public-facing pages beyond the auth-protected areas.

## Features

### Core Capabilities
- **Multiple Pre-built Page Templates**
  - Landing pages
  - Features showcase
  - About pages
  - Contact forms
  - Blog layouts
  - Services pages
  - Pricing tables
  - Testimonials
  - Legal pages (Privacy Policy, Terms of Service, Cookies, GDPR)

### Section Library
- Diverse section types with customizable layouts:
  - Hero sections
  - Feature grids
  - Testimonial carousels
  - Pricing tables
  - Call-to-action blocks
  - FAQ sections
  - Team showcases
  - Galleries
  - Statistics
  - Contact forms
  - Newsletter signups
  - Blog post lists

### Content Management
- Flexible content blocks with configurable:
  - Size and placement
  - Layout structure
  - Styling options
- Reusable sections across pages
- Global sections for consistent branding

### Design System
- Multiple pre-built theme options:
  - Modern
  - Classic
  - Minimal
  - Bold
  - Elegant
  - Creative
  - Custom
- Customizable theme configurations
- Responsive components
- Custom CSS support

### SEO Optimization
- Page-level SEO settings
- Meta title and description management
- Open Graph tags
- Twitter Card support
- Custom canonical URLs
- Sitemap generation support
- Structured data support

### Publishing Features
- Draft/Published/Scheduled states
- Version control
- Preview mode
- Custom domain support
- Subdomain support

### Collaboration
- Role-based access control:
  - Owner
  - Admin
  - Editor
  - Viewer
- Granular permissions
- Team management

## Architecture

### Backend (Convex)

#### Schema Tables
- `websites` - Main website configurations
- `websitePages` - Individual pages
- `websiteSections` - Reusable content sections
- `websiteThemes` - Theme configurations
- `websiteTemplates` - Pre-built page templates
- `websiteCollaborators` - Team access management

#### Queries
- `getWebsites` - List websites with filtering and pagination
- `getWebsite` - Get single website
- `getWebsitePages` - Get pages for a website
- `getPageWithSections` - Get page with populated sections
- `getWebsiteSections` - Get sections for a website
- `getThemes` - Get available themes
- `getTemplates` - Get page templates
- `getWebsiteStats` - Get usage statistics

#### Mutations
- `createWebsite` - Create new website
- `updateWebsite` - Update website settings
- `publishWebsite` - Publish website
- `deleteWebsite` - Soft delete website
- `createPage` - Create new page
- `updatePage` - Update page content
- `publishPage` - Publish page
- `deletePage` - Delete page
- `createSection` - Create reusable section
- `updateSection` - Update section
- `deleteSection` - Delete section
- `addCollaborator` - Add team member
- `removeCollaborator` - Remove team member

### Frontend (React + TanStack)

#### Services
- `WebsitesService` - Centralized service for all website operations
- Query options for SSR cache hits
- Mutation hooks for data changes

#### Hooks
- `useWebsites` - Manage website list and operations
- `useWebsite` - Manage single website
- Custom hooks for pages, sections, themes

#### Components
- `WebsiteCard` - Display website summary
- `WebsiteForm` - Create/edit website form
- Page builder components (coming soon)
- Section library components (coming soon)

#### Pages
- `WebsitesPage` - Main website list and management
- Individual website pages (coming soon)
- Page editor (coming soon)

## Usage

### Creating a Website

```typescript
import { useWebsites } from '@/features/boilerplate/websites'

function MyComponent() {
  const { createWebsite } = useWebsites()

  const handleCreate = async () => {
    await createWebsite({
      name: 'My Website',
      description: 'A beautiful website',
      visibility: 'public',
      subdomain: 'mysite',
    })
  }

  return <button onClick={handleCreate}>Create Website</button>
}
```

### Creating a Page

```typescript
import { websitesService } from '@/features/boilerplate/websites'

function MyComponent({ websiteId }) {
  const createPage = websitesService.useCreatePage()

  const handleCreate = async () => {
    await createPage({
      websiteId,
      title: 'About Us',
      templateType: 'about',
      layout: 'full_width',
      sections: [],
    })
  }

  return <button onClick={handleCreate}>Create Page</button>
}
```

## Configuration

Edit `/src/features/boilerplate/websites/config/index.ts` to configure:
- Website limits
- Feature flags
- Default settings

## Permissions

The website addon uses role-based access control:

- **Owner**: Full control over website
- **Admin**: Can edit, publish, and manage team
- **Editor**: Can edit pages (with optional publish permission)
- **Viewer**: Read-only access

## Future Enhancements

- Visual page builder interface
- Drag-and-drop section ordering
- Real-time preview
- A/B testing capabilities
- Advanced analytics integration
- Form builder
- E-commerce integration
- Multi-language support
- Custom domain SSL management
- CDN integration

## Integration with Projects Addon

The website addon follows the same architecture patterns as the projects addon:
- Layered architecture (Pages → Hooks → Service → Backend)
- Type-safe interfaces
- Permission-based access control
- Audit trails
- Soft deletes
- i18n ready

## API Reference

See the generated API documentation for full details on all available functions and types.
