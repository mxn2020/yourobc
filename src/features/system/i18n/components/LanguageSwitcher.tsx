// src/features/boilerplate/i18n/components/LanguageSwitcher.tsx

/**
 * Language Switcher Component
 *
 * A ready-to-use dropdown component for switching between available languages.
 * This component can be used in navigation bars, settings pages, or anywhere
 * language selection is needed.
 */

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/features/boilerplate/i18n/config';

interface LanguageSwitcherProps {
  /**
   * Current active locale
   */
  currentLocale?: Locale;

  /**
   * Callback when language is changed
   */
  onLocaleChange?: (locale: Locale) => void;

  /**
   * Visual variant
   */
  variant?: 'dropdown' | 'minimal' | 'buttons' | 'compact' | 'sidebar' | 'sidebar-collapsed';

  /**
   * Show flags next to language names
   */
  showFlags?: boolean;

  /**
   * Custom className for styling
   */
  className?: string;
}

export function LanguageSwitcher({
  currentLocale = 'en',
  onLocaleChange,
  variant = 'dropdown',
  showFlags = true,
  className = '',
}: LanguageSwitcherProps) {
  const [selectedLocale, setSelectedLocale] = useState<Locale>(currentLocale);

  useEffect(() => {
    setSelectedLocale(currentLocale);
  }, [currentLocale]);

  const handleChange = (locale: Locale) => {
    setSelectedLocale(locale);
    onLocaleChange?.(locale);

    // Store preference in localStorage
    localStorage.setItem('preferredLocale', locale);
  };

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={`relative inline-block ${className}`}>
        <select
          value={selectedLocale}
          onChange={(e) => handleChange(e.target.value as Locale)}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
        >
          {locales.map((locale) => (
            <option key={locale} value={locale}>
              {showFlags ? `${localeFlags[locale]} ` : ''}
              {localeNames[locale]}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <Globe className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Minimal variant (just flag/icon with dropdown)
  if (variant === 'minimal') {
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => {
            const currentIndex = locales.indexOf(selectedLocale);
            const nextIndex = (currentIndex + 1) % locales.length;
            handleChange(locales[nextIndex]);
          }}
        >
          <Globe className="w-4 h-4" />
          {showFlags && (
            <span className="text-lg">{localeFlags[selectedLocale]}</span>
          )}
          <span className="hidden sm:inline">{localeNames[selectedLocale]}</span>
        </button>
      </div>
    );
  }

  // Button group variant
  if (variant === 'buttons') {
    return (
      <div className={`inline-flex rounded-lg shadow-sm ${className}`}>
        {locales.map((locale, index) => (
          <button
            key={locale}
            onClick={() => handleChange(locale)}
            className={`
              px-4 py-2 text-sm font-medium
              ${index === 0 ? 'rounded-l-lg' : ''}
              ${index === locales.length - 1 ? 'rounded-r-lg' : ''}
              ${
                selectedLocale === locale
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
              border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10
              ${index > 0 ? '-ml-px' : ''}
            `}
          >
            {showFlags && (
              <span className="mr-2">{localeFlags[locale]}</span>
            )}
            <span className="hidden sm:inline">{localeNames[locale]}</span>
            <span className="sm:hidden">{locale.toUpperCase()}</span>
          </button>
        ))}
      </div>
    );
  }

  // Compact variant (small, icon-only click-to-cycle for headers)
  if (variant === 'compact') {
    return (
      <button
        className={`inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${className}`}
        onClick={() => {
          const currentIndex = locales.indexOf(selectedLocale);
          const nextIndex = (currentIndex + 1) % locales.length;
          handleChange(locales[nextIndex]);
        }}
        title={`Current: ${localeNames[selectedLocale]} - Click to switch`}
      >
        {showFlags ? (
          <span className="text-base">{localeFlags[selectedLocale]}</span>
        ) : (
          <Globe className="w-4 h-4" />
        )}
      </button>
    );
  }

  // Sidebar variant (full width with label)
  if (variant === 'sidebar') {
    return (
      <button
        className={`w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${className}`}
        onClick={() => {
          const currentIndex = locales.indexOf(selectedLocale);
          const nextIndex = (currentIndex + 1) % locales.length;
          handleChange(locales[nextIndex]);
        }}
        title="Click to switch language"
      >
        <Globe className="w-4 h-4 mr-3 text-gray-500" />
        {showFlags && (
          <span className="text-base mr-2">{localeFlags[selectedLocale]}</span>
        )}
        <span className="flex-1 text-left">{localeNames[selectedLocale]}</span>
      </button>
    );
  }

  // Sidebar collapsed variant (icon only, centered)
  if (variant === 'sidebar-collapsed') {
    return (
      <button
        className={`w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${className}`}
        onClick={() => {
          const currentIndex = locales.indexOf(selectedLocale);
          const nextIndex = (currentIndex + 1) % locales.length;
          handleChange(locales[nextIndex]);
        }}
        title={`${localeNames[selectedLocale]} - Click to switch`}
      >
        {showFlags ? (
          <span className="text-base">{localeFlags[selectedLocale]}</span>
        ) : (
          <Globe className="w-4 h-4" />
        )}
      </button>
    );
  }

  return null;
}

/**
 * Hook to get and set the user's preferred locale
 */
export function usePreferredLocale(): [Locale, (locale: Locale) => void] {
  const [locale, setLocale] = useState<Locale>(() => {
    // Try to get from localStorage
    const stored = localStorage.getItem('preferredLocale');
    if (stored && locales.includes(stored as Locale)) {
      return stored as Locale;
    }

    // Try to get from browser
    const browserLang = navigator.language.split('-')[0];
    if (locales.includes(browserLang as Locale)) {
      return browserLang as Locale;
    }

    // Default to English
    return 'en';
  });

  const updateLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('preferredLocale', newLocale);
  };

  return [locale, updateLocale];
}
