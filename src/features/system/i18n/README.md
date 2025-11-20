// src/features/system/i18n/README.md

# Internationalization (i18n) System

Comprehensive internationalization system with configurable locale support, automatic detection, and SEO optimization.

## Features

- ✅ **File-based routing** - Routes under `/$locale/` directory for clean URLs
- ✅ **Multiple locales** - Support for 5 languages: English, Spanish, French, German, Chinese
- ✅ **Locale detection** - Automatic browser locale detection
- ✅ **Persistence** - Save user's locale preference
- ✅ **SEO optimized** - Proper hreflang tags and sitemap generation
- ✅ **Performance** - In-memory translation caching
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Configurable** - Enable/disable features via environment variables

## Quick Start

### As Shipped (Localized URLs)

The system comes with i18n enabled by default:

- Routes are in `src/routes/$locale/`
- URLs include locale: `/en/dashboard`, `/de/projects`, `/es/blog`
- Language switcher appears in navigation
- SEO tags included automatically

### To Disable i18n (Single Language)

If you want a single-language app without locale prefixes:

**Step 1:** Move routes out of `$locale` folder

```bash
# Move all routes from src/routes/$locale/ to src/routes/
mv src/routes/$locale/* src/routes/
# Delete the now-empty $locale folder
rm -rf src/routes/$locale
# Delete the locale redirect
rm src/routes/index.tsx
```

**Step 2:** Remove locale parameter from route definitions

```ts
// Before: src/routes/$locale/dashboard.tsx
export const Route = createFileRoute('/$locale/dashboard')({...})

// After: src/routes/dashboard.tsx
export const Route = createFileRoute('/dashboard')({...})
```

**Step 3:** Configure environment

```bash
# .env.local
VITE_ENABLE_I18N=false
VITE_I18N_SHOW_LANGUAGE_SWITCHER=false
```

**Step 4:** Remove i18n code (optional)

You can remove unused i18n components, but keeping them is harmless.

Now your URLs will be `/dashboard`, `/projects` instead of `/en/dashboard`, `/en/projects`.

## Configuration

Configure i18n behavior via environment variables in `.env.local`:

```bash
# Enable/disable i18n (default: true)
VITE_ENABLE_I18N=true

# Default locale (default: en)
VITE_I18N_DEFAULT_LOCALE=en

# Enabled locales - comma-separated (default: all locales)
# Only these locales will be available in the language switcher
VITE_I18N_ENABLED_LOCALES=en,es,fr,de,zh

# Fallback locale for missing translations (default: en)
VITE_I18N_FALLBACK_LOCALE=en

# Auto-detect browser language (default: true)
VITE_I18N_DETECT_BROWSER_LOCALE=true

# Persist locale in localStorage (default: true)
VITE_I18N_PERSIST_LOCALE=true

# Show language switcher in UI (default: true)
VITE_I18N_SHOW_LANGUAGE_SWITCHER=true

# Cache translations in memory (default: true)
VITE_I18N_CACHE_TRANSLATIONS=true

# Show console warnings for missing translations (default: true)
VITE_I18N_SHOW_MISSING_WARNINGS=true
```

## Usage

### Basic Translation

```tsx
import { useTranslation } from '@/i18n'

function MyComponent() {
  const { t, locale } = useTranslation('projects')

  return (
    <div>
      <h1>{t('page.title')}</h1>
      <p>{t('page.description')}</p>
      <p>Current locale: {locale}</p>
    </div>
  )
}
```

### Translation with Variables

```tsx
const { t } = useTranslation('common')

// In translation file: "greeting": "Hello, {name}!"
const message = t('greeting', { name: 'John' })
// Output: "Hello, John!"
```

### Language Switcher

```tsx
import { LanguageSwitcher } from '@/components/i18n'

function Navigation() {
  return (
    <nav>
      {/* Automatically hidden if only one locale enabled */}
      <LanguageSwitcher />
    </nav>
  )
}
```

### Locale-Aware Links

```tsx
import { Link } from '@/components/i18n'

function MyComponent() {
  return (
    <>
      {/* Automatically adds locale prefix */}
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/projects">Projects</Link>
    </>
  )
}
```

## URL Structure

With default configuration (routes under `$locale/` folder):

```
/                      → Redirects to /en/
/en/dashboard          → English dashboard
/de/dashboard          → German dashboard
/es/projects           → Spanish projects
/fr/blog              → French blog
```

## Limiting Available Languages

To only enable specific locales:

```bash
# .env.local
VITE_I18N_ENABLED_LOCALES=en,es  # Only English and Spanish
```

This will:
- Hide other languages from the switcher
- Only generate sitemap entries for these locales
- Only show these in hreflang tags

## Adding a New Locale

**Step 1:** Add locale to configuration

```ts
// src/i18n/config.ts
export const locales = ['en', 'es', 'fr', 'de', 'zh', 'ja'] as const

export const localeNames = {
  // ...existing
  ja: '日本語',
}

export const localeFlags = {
  // ...existing
  ja: '🇯🇵',
}

export const localeMetadata: Record<Locale, {...}> = {
  // ...existing
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    dateFormat: 'yyyy/MM/dd',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: 'JPY',
    },
  },
}
```

**Step 2:** Create translation files

```bash
mkdir src/i18n/locales/ja
cp src/i18n/locales/en/*.json src/i18n/locales/ja/
```

**Step 3:** Translate the files

Edit all JSON files in `src/i18n/locales/ja/` with Japanese translations.

**Step 4:** Enable the locale

```bash
# .env.local
VITE_I18N_ENABLED_LOCALES=en,es,fr,de,zh,ja
```

## Translation Files

Translations are organized by namespace:

```
src/i18n/locales/
├── en/
│   ├── common.json      # Common translations (navbar, footer, etc.)
│   ├── ui.json          # UI components (buttons, forms, etc.)
│   ├── auth.json        # Authentication pages
│   ├── projects.json    # Project management
│   ├── blog.json        # Blog feature
│   └── admin.json       # Admin panel
├── es/
│   └── ...
└── ...
```

### Translation File Format

```json
{
  "page": {
    "title": "My Projects",
    "description": "Manage your projects"
  },
  "actions": {
    "create": "Create Project",
    "edit": "Edit",
    "delete": "Delete"
  },
  "messages": {
    "greeting": "Hello, {name}!",
    "projectCount": "You have {count} projects"
  }
}
```

## SEO Optimization

The system automatically generates:

- **hreflang tags** in page headers for all enabled locales
- **Locale-specific sitemaps** at `/sitemap.xml`
- **Language alternates** for all pages
- **Proper HTML lang attribute**

## Architecture

### How It Works

1. **File-based routing**: All localized routes are in `src/routes/$locale/`
2. **Server-side loading**: `__root.tsx` loads all translations before rendering
3. **Client hydration**: Translations serialized to `window.__TRANSLATIONS__`
4. **React Context**: `I18nProvider` makes translations available via `useTranslation()`

### Files

- `src/i18n/config.ts` - Locale definitions and metadata
- `src/i18n/config/i18n-config.ts` - Environment-based configuration
- `src/i18n/context.tsx` - React context for translations
- `src/i18n/server.ts` - Server-side utilities
- `src/i18n/hooks.tsx` - React hooks
- `src/i18n/utils.ts` - Formatting utilities
- `src/i18n/types.ts` - TypeScript types

### Performance

- **Translation caching**: Enabled by default, configurable
- **Single translation load**: All namespaces loaded at root
- **No hydration mismatches**: Server and client use same translations
- **Lazy loading**: Only enabled locales are loaded

## Troubleshooting

### Missing translation warnings

If you see warnings like `Missing translation: projects.page.title`:

1. Check if the key exists in the translation file
2. Ensure the namespace is loaded in `__root.tsx`
3. Verify the translation file syntax is valid JSON
4. Check the key path matches the JSON structure

### Language switcher not showing

Check these settings:
- `VITE_ENABLE_I18N=true`
- `VITE_I18N_SHOW_LANGUAGE_SWITCHER=true`
- Multiple locales in `VITE_I18N_ENABLED_LOCALES`

### Translations not updating

1. Clear translation cache: restart dev server
2. Check if `VITE_I18N_CACHE_TRANSLATIONS=true` (disable for development)
3. Verify JSON file syntax
4. Check file permissions

## Best Practices

1. **Use namespaces**: Organize translations by feature
2. **Keep keys semantic**: `projects.page.title` not `projects.title1`
3. **Use variables**: `"greeting": "Hello, {name}!"` for dynamic content
4. **Provide fallbacks**: Always have English translations
5. **Test all locales**: Verify translations in production
6. **Keep consistent**: Use same key structure across locales

## API Reference

### `useTranslation(namespace?)`

React hook for accessing translations.

```ts
const { t, locale } = useTranslation('projects')
```

### `I18N_CONFIG`

Global configuration object.

```ts
import { I18N_CONFIG } from '@/i18n'

console.log(I18N_CONFIG.enabled) // boolean
console.log(I18N_CONFIG.defaultLocale) // Locale
console.log(I18N_CONFIG.enabledLocales) // Locale[]
```

### `isI18nEnabled()`

Check if i18n is enabled.

```ts
import { isI18nEnabled } from '@/i18n'

if (isI18nEnabled()) {
  // Show language switcher
}
```

### `getEnabledLocales()`

Get list of enabled locales.

```ts
import { getEnabledLocales } from '@/i18n'

const locales = getEnabledLocales() // ['en', 'es', 'fr']
```

## Frequently Asked Questions

### Can I have URLs without locale prefix?

Yes, but you need to move routes out of the `$locale/` folder (see "To Disable i18n" above). The URL structure is determined by file location, not configuration.

### Why are my routes still under /$locale/ when I set VITE_ENABLE_I18N=false?

The configuration doesn't change file-based routing. You need to physically move route files out of the `$locale/` folder.

### Can I have both /dashboard and /en/dashboard?

No, with TanStack Router's file-based routing, you must choose one structure. This system uses `/$locale/dashboard` by default.

### What if I only want one language but keep the architecture?

Set `VITE_I18N_ENABLED_LOCALES=en` and `VITE_I18N_SHOW_LANGUAGE_SWITCHER=false`. URLs will still have `/en/` prefix but the app behaves as single-language.

## License

Part of Geenius System - see root LICENSE file.
