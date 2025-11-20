// src/components/DefaultCatchBoundary.tsx

import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
  useParams,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { Button, Card } from '@/components/ui'
import { defaultLocale } from '@/features/boilerplate/i18n'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const params = useParams({ strict: false });
  const locale = (params as any).locale;
  const currentLocale = locale || defaultLocale;
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  })

  console.error(error)

  return (
    <div className="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6">
      <Card className="p-6 max-w-2xl w-full">
        <ErrorComponent error={error} />
        <div className="flex gap-2 items-center flex-wrap mt-4">
          <Button
            onClick={() => {
              router.invalidate()
            }}
            variant="primary"
          >
            Try Again
          </Button>
          {isRoot ? (
            <Button asChild>
              <Link
                to="/{-$locale}"
                params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
              >
                Home
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link
                to="/{-$locale}"
                params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
                onClick={(e) => {
                  e.preventDefault()
                  window.history.back()
                }}
              >
                Go Back
              </Link>
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
