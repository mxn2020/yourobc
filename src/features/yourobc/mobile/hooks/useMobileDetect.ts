// src/features/yourobc/mobile/hooks/useMobileDetect.ts

import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface MobileDetection {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  deviceType: DeviceType
  breakpoint: Breakpoint
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
  isTouchDevice: boolean
}

/**
 * Hook to detect mobile/tablet/desktop devices and screen dimensions
 * Tailwind breakpoints:
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 */
export function useMobileDetect(): MobileDetection {
  const [detection, setDetection] = useState<MobileDetection>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        deviceType: 'desktop',
        breakpoint: 'xl',
        width: 1920,
        height: 1080,
        orientation: 'landscape',
        isTouchDevice: false,
      }
    }

    return calculateDetection()
  })

  useEffect(() => {
    function handleResize() {
      setDetection(calculateDetection())
    }

    function handleOrientationChange() {
      // Delay to get accurate dimensions after orientation change
      setTimeout(() => {
        setDetection(calculateDetection())
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return detection
}

function calculateDetection(): MobileDetection {
  const width = window.innerWidth
  const height = window.innerHeight
  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.maxTouchPoints > 0

  // Determine breakpoint
  let breakpoint: Breakpoint
  if (width < 640) {
    breakpoint = 'sm'
  } else if (width < 768) {
    breakpoint = 'md'
  } else if (width < 1024) {
    breakpoint = 'lg'
  } else if (width < 1280) {
    breakpoint = 'xl'
  } else {
    breakpoint = '2xl'
  }

  // Determine device type
  let deviceType: DeviceType
  let isMobile = false
  let isTablet = false
  let isDesktop = false

  if (width < 640) {
    deviceType = 'mobile'
    isMobile = true
  } else if (width < 1024) {
    deviceType = 'tablet'
    isTablet = true
  } else {
    deviceType = 'desktop'
    isDesktop = true
  }

  // Determine orientation
  const orientation: 'portrait' | 'landscape' = width < height ? 'portrait' : 'landscape'

  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
    breakpoint,
    width,
    height,
    orientation,
    isTouchDevice,
  }
}

/**
 * Hook to check if viewport matches a specific breakpoint
 */
export function useBreakpoint(targetBreakpoint: Breakpoint): boolean {
  const { breakpoint } = useMobileDetect()

  const breakpointOrder: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl']
  const currentIndex = breakpointOrder.indexOf(breakpoint)
  const targetIndex = breakpointOrder.indexOf(targetBreakpoint)

  return currentIndex >= targetIndex
}

/**
 * Hook to check if device supports touch
 */
export function useTouchDevice(): boolean {
  const { isTouchDevice } = useMobileDetect()
  return isTouchDevice
}

/**
 * Hook to get viewport dimensions
 */
export function useViewportSize(): { width: number; height: number } {
  const { width, height } = useMobileDetect()
  return { width, height }
}
