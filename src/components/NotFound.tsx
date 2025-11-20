// src/components/NotFound.tsx

import { Link, useParams } from '@tanstack/react-router'
import { Button, Card } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'

export function NotFound({ children }: { children?: any }) {
  const params = useParams({ strict: false });
  const locale = (params as any).locale;
  const currentLocale = locale || defaultLocale;
  return (
    <Card className="space-y-4 p-6">
      <div className="text-gray-600 dark:text-gray-400">
        {children || <p>The page you are looking for does not exist.</p>}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={() => window.history.back()}
          variant="primary"
        >
          Go back
        </Button>
        <Button asChild>
          <Link
            to="/{-$locale}"
            params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
          >
            Start Over
          </Link>
        </Button>
      </div>
    </Card>
  )
}
