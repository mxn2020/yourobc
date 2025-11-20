// src/features/system/i18n/components/LanguageSwitcherDropdown.tsx

import { useI18n } from '@/features/system/i18n/context'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { localeMetadata } from '@/features/system/i18n/config'
import { I18N_CONFIG, getEnabledLocales } from '@/features/system/i18n'
import { stripLocaleFromPath } from '@/features/system/i18n/utils/path'
import type { Locale } from '@/features/system/i18n/config'
import { Check } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface LanguageSwitcherDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export function LanguageSwitcherDropdown({ isOpen, onClose }: LanguageSwitcherDropdownProps) {
  const { locale } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Don't render if i18n is disabled
  if (!I18N_CONFIG.enabled) {
    return null
  }

  const enabledLocales = getEnabledLocales()

  // Don't render if only one locale is enabled
  if (enabledLocales.length <= 1) {
    return null
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleChange = (newLocale: Locale) => {
    // Get current path without locale: /de/projects → /projects
    const pathWithoutLocale = stripLocaleFromPath(location.pathname)

    // Navigate to same path with new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`

    navigate({ to: newPath as any })

    // Persist locale if enabled
    if (I18N_CONFIG.persistLocale && typeof window !== 'undefined') {
      try {
        localStorage.setItem('locale', newLocale)
      } catch (error) {
        console.warn('Failed to persist locale:', error)
      }
    }

    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 py-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] z-[100]"
    >
      <div className="px-4 py-2 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Select Language
        </p>
      </div>
      <div className="py-1">
        {enabledLocales.map((loc) => {
          const metadata = localeMetadata[loc]
          const isActive = loc === locale

          return (
            <button
              key={loc}
              onClick={() => handleChange(loc)}
              className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{metadata.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {metadata.nativeName}
                  </span>
                  <span className="text-xs text-gray-500">{metadata.name}</span>
                </div>
              </div>
              {isActive && (
                <Check className="h-4 w-4 text-indigo-600" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
