// src/components/ui/Resizable.tsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  memo,
  ReactNode,
  HTMLAttributes,
  MouseEvent,
  TouchEvent
} from 'react'
import { twMerge } from 'tailwind-merge'

// ============================================================================
// TYPES
// ============================================================================

type Direction = 'horizontal' | 'vertical'
type PanelConstraint = { min?: number; max?: number; default?: number }

interface ResizableContextValue {
  direction: Direction
  registerPanel: (id: string, constraint: PanelConstraint) => void
  unregisterPanel: (id: string) => void
  getPanelSize: (id: string) => number
  updatePanelSize: (id: string, size: number) => void
  startResize: (handleId: string) => void
  activeHandleId: string | null
}

interface PanelData {
  id: string
  size: number
  constraint: PanelConstraint
}

// ============================================================================
// CONTEXT
// ============================================================================

const ResizableContext = createContext<ResizableContextValue | undefined>(undefined)

const useResizableContext = () => {
  const context = useContext(ResizableContext)
  if (!context) {
    throw new Error('Resizable compound components must be used within a ResizablePanelGroup')
  }
  return context
}

// ============================================================================
// RESIZABLE PANEL GROUP (ROOT)
// ============================================================================

interface ResizablePanelGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  direction?: Direction
  className?: string
  autoSaveId?: string // Optional: save layout to localStorage
  onLayout?: (sizes: number[]) => void // Callback when layout changes
}

export const ResizablePanelGroup = memo(forwardRef<HTMLDivElement, ResizablePanelGroupProps>(
  ({
    children,
    direction = 'horizontal',
    className,
    autoSaveId,
    onLayout,
    ...props
  }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [panels, setPanels] = useState<Map<string, PanelData>>(new Map())
    const [activeHandleId, setActiveHandleId] = useState<string | null>(null)
    const isDraggingRef = useRef(false)

    // Merge refs
    const mergedRef = useCallback((node: HTMLDivElement | null) => {
      containerRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }, [ref])

    // Register panel
    const registerPanel = useCallback((id: string, constraint: PanelConstraint) => {
      setPanels(prev => {
        const newPanels = new Map(prev)

        // Load from localStorage if autoSaveId is provided
        let size = constraint.default ?? 50
        if (autoSaveId) {
          const saved = localStorage.getItem(`resizable-${autoSaveId}-${id}`)
          if (saved) {
            const savedSize = parseFloat(saved)
            if (!isNaN(savedSize)) {
              size = savedSize
            }
          }
        }

        newPanels.set(id, { id, size, constraint })
        return newPanels
      })
    }, [autoSaveId])

    // Unregister panel
    const unregisterPanel = useCallback((id: string) => {
      setPanels(prev => {
        const newPanels = new Map(prev)
        newPanels.delete(id)
        return newPanels
      })
    }, [])

    // Get panel size
    const getPanelSize = useCallback((id: string) => {
      return panels.get(id)?.size ?? 50
    }, [panels])

    // Update panel size
    const updatePanelSize = useCallback((id: string, size: number) => {
      setPanels(prev => {
        const newPanels = new Map(prev)
        const panel = newPanels.get(id)
        if (panel) {
          // Apply constraints
          let constrainedSize = size
          if (panel.constraint.min !== undefined) {
            constrainedSize = Math.max(constrainedSize, panel.constraint.min)
          }
          if (panel.constraint.max !== undefined) {
            constrainedSize = Math.min(constrainedSize, panel.constraint.max)
          }

          newPanels.set(id, { ...panel, size: constrainedSize })

          // Save to localStorage if autoSaveId is provided
          if (autoSaveId) {
            localStorage.setItem(`resizable-${autoSaveId}-${id}`, constrainedSize.toString())
          }
        }
        return newPanels
      })
    }, [autoSaveId])

    // Start resize
    const startResize = useCallback((handleId: string) => {
      setActiveHandleId(handleId)
      isDraggingRef.current = true
    }, [])

    // Call onLayout when sizes change
    useEffect(() => {
      if (onLayout) {
        const sizes = Array.from(panels.values()).map(p => p.size)
        onLayout(sizes)
      }
    }, [panels, onLayout])

    // Global mouse/touch up handler
    useEffect(() => {
      const handleUp = () => {
        if (isDraggingRef.current) {
          setActiveHandleId(null)
          isDraggingRef.current = false
        }
      }

      window.addEventListener('mouseup', handleUp)
      window.addEventListener('touchend', handleUp)

      return () => {
        window.removeEventListener('mouseup', handleUp)
        window.removeEventListener('touchend', handleUp)
      }
    }, [])

    return (
      <ResizableContext.Provider
        value={{
          direction,
          registerPanel,
          unregisterPanel,
          getPanelSize,
          updatePanelSize,
          startResize,
          activeHandleId,
        }}
      >
        <div
          ref={mergedRef}
          className={twMerge(
            'flex w-full h-full overflow-hidden',
            direction === 'horizontal' ? 'flex-row' : 'flex-col',
            className
          )}
          data-panel-group=""
          data-direction={direction}
          {...props}
        >
          {children}
        </div>
      </ResizableContext.Provider>
    )
  }
))
ResizablePanelGroup.displayName = 'ResizablePanelGroup'

// ============================================================================
// RESIZABLE PANEL
// ============================================================================

interface ResizablePanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  defaultSize?: number
  minSize?: number
  maxSize?: number
  className?: string
  id?: string
  collapsible?: boolean
  collapsedSize?: number
  onCollapse?: () => void
  onExpand?: () => void
}

export const ResizablePanel = memo(forwardRef<HTMLDivElement, ResizablePanelProps>(
  ({
    children,
    defaultSize = 50,
    minSize,
    maxSize,
    className,
    id: providedId,
    collapsible = false,
    collapsedSize = 0,
    onCollapse,
    onExpand,
    ...props
  }, ref) => {
    const { direction, registerPanel, unregisterPanel, getPanelSize } = useResizableContext()
    const [panelId] = useState(() => providedId || `panel-${Math.random().toString(36).substr(2, 9)}`)
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Register on mount
    useEffect(() => {
      registerPanel(panelId, {
        min: minSize,
        max: maxSize,
        default: defaultSize
      })

      return () => {
        unregisterPanel(panelId)
      }
    }, [panelId, registerPanel, unregisterPanel, minSize, maxSize, defaultSize])

    const size = getPanelSize(panelId)

    // Handle collapse
    useEffect(() => {
      if (collapsible && size <= (collapsedSize + 1)) {
        if (!isCollapsed) {
          setIsCollapsed(true)
          onCollapse?.()
        }
      } else {
        if (isCollapsed) {
          setIsCollapsed(false)
          onExpand?.()
        }
      }
    }, [size, collapsible, collapsedSize, isCollapsed, onCollapse, onExpand])

    const style = direction === 'horizontal'
      ? { width: `${size}%`, flexShrink: 0 }
      : { height: `${size}%`, flexShrink: 0 }

    return (
      <div
        ref={ref}
        className={twMerge(
          'relative overflow-auto',
          isCollapsed && 'overflow-hidden',
          className
        )}
        style={style}
        data-panel=""
        data-panel-id={panelId}
        data-panel-size={size}
        data-panel-collapsed={isCollapsed}
        {...props}
      >
        {children}
      </div>
    )
  }
))
ResizablePanel.displayName = 'ResizablePanel'

// ============================================================================
// RESIZABLE HANDLE
// ============================================================================

interface ResizableHandleProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
  withHandle?: boolean // Show drag handle indicator
  disabled?: boolean
  onDragging?: (isDragging: boolean) => void
}

export const ResizableHandle = memo(forwardRef<HTMLDivElement, ResizableHandleProps>(
  ({
    className,
    withHandle = false,
    disabled = false,
    onDragging,
    ...props
  }, ref) => {
    const { direction, startResize, activeHandleId, updatePanelSize } = useResizableContext()
    const [handleId] = useState(() => `handle-${Math.random().toString(36).substr(2, 9)}`)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const startPosRef = useRef(0)
    const panelBeforeRef = useRef<{ id: string; initialSize: number } | null>(null)
    const panelAfterRef = useRef<{ id: string; initialSize: number } | null>(null)

    // Merge refs
    const mergedRef = useCallback((node: HTMLDivElement | null) => {
      containerRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }, [ref])

    // Track active dragging state
    useEffect(() => {
      const isActive = activeHandleId === handleId
      if (isDragging !== isActive) {
        setIsDragging(isActive)
        onDragging?.(isActive)
      }
    }, [activeHandleId, handleId, isDragging, onDragging])

    // Handle mouse/touch down
    const handlePointerDown = useCallback((clientX: number, clientY: number) => {
      if (disabled) return

      const handle = containerRef.current
      if (!handle) return

      // Find adjacent panels
      const panelGroup = handle.closest('[data-panel-group]')
      if (!panelGroup) return

      const allPanels = Array.from(panelGroup.querySelectorAll('[data-panel]'))
      const handleIndex = Array.from(panelGroup.children).indexOf(handle)

      const panelBefore = allPanels[Math.floor(handleIndex / 2)] as HTMLElement
      const panelAfter = allPanels[Math.ceil(handleIndex / 2)] as HTMLElement

      if (!panelBefore || !panelAfter) return

      const panelBeforeId = panelBefore.getAttribute('data-panel-id')
      const panelAfterId = panelAfter.getAttribute('data-panel-id')

      if (!panelBeforeId || !panelAfterId) return

      const panelBeforeSize = parseFloat(panelBefore.getAttribute('data-panel-size') || '50')
      const panelAfterSize = parseFloat(panelAfter.getAttribute('data-panel-size') || '50')

      panelBeforeRef.current = { id: panelBeforeId, initialSize: panelBeforeSize }
      panelAfterRef.current = { id: panelAfterId, initialSize: panelAfterSize }

      startPosRef.current = direction === 'horizontal' ? clientX : clientY
      startResize(handleId)
    }, [disabled, direction, handleId, startResize])

    const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      handlePointerDown(e.clientX, e.clientY)
    }, [handlePointerDown])

    const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      handlePointerDown(touch.clientX, touch.clientY)
    }, [handlePointerDown])

    // Handle mouse/touch move
    useEffect(() => {
      if (!isDragging) return

      const handleMove = (e: globalThis.MouseEvent | globalThis.TouchEvent) => {
        if (!panelBeforeRef.current || !panelAfterRef.current) return

        const handle = containerRef.current
        const panelGroup = handle?.closest('[data-panel-group]')
        if (!panelGroup) return

        const rect = panelGroup.getBoundingClientRect()
        const totalSize = direction === 'horizontal' ? rect.width : rect.height

        let currentPos: number
        if (e instanceof globalThis.MouseEvent) {
          currentPos = direction === 'horizontal' ? e.clientX : e.clientY
        } else {
          if (e.touches.length !== 1) return
          currentPos = direction === 'horizontal' ? e.touches[0].clientX : e.touches[0].clientY
        }

        const delta = currentPos - startPosRef.current
        const deltaPercent = (delta / totalSize) * 100

        const newBeforeSize = panelBeforeRef.current.initialSize + deltaPercent
        const newAfterSize = panelAfterRef.current.initialSize - deltaPercent

        updatePanelSize(panelBeforeRef.current.id, newBeforeSize)
        updatePanelSize(panelAfterRef.current.id, newAfterSize)
      }

      const handleMouseMove = (e: globalThis.MouseEvent) => handleMove(e)
      const handleTouchMove = (e: globalThis.TouchEvent) => handleMove(e)

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('touchmove', handleTouchMove)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('touchmove', handleTouchMove)
      }
    }, [isDragging, direction, updatePanelSize])

    const isHorizontal = direction === 'horizontal'

    return (
      <div
        ref={mergedRef}
        className={twMerge(
          'relative flex items-center justify-center bg-gray-200 transition-colors',
          isHorizontal ? 'w-1 cursor-col-resize hover:bg-blue-400' : 'h-1 cursor-row-resize hover:bg-blue-400',
          isDragging && 'bg-blue-500',
          disabled && 'cursor-not-allowed opacity-50 hover:bg-gray-200',
          className
        )}
        data-panel-resize-handle=""
        data-direction={direction}
        data-disabled={disabled}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="separator"
        aria-orientation={direction}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {withHandle && (
          <div
            className={twMerge(
              'absolute z-10 flex items-center justify-center rounded-sm border border-gray-300 bg-gray-200',
              isHorizontal ? 'h-8 w-2.5 flex-col' : 'h-2.5 w-8 flex-row'
            )}
          >
            <div className={twMerge(
              'rounded-full bg-gray-400',
              isHorizontal ? 'h-1 w-1 my-0.5' : 'w-1 h-1 mx-0.5'
            )} />
            <div className={twMerge(
              'rounded-full bg-gray-400',
              isHorizontal ? 'h-1 w-1 my-0.5' : 'w-1 h-1 mx-0.5'
            )} />
            <div className={twMerge(
              'rounded-full bg-gray-400',
              isHorizontal ? 'h-1 w-1 my-0.5' : 'w-1 h-1 mx-0.5'
            )} />
          </div>
        )}
      </div>
    )
  }
))
ResizableHandle.displayName = 'ResizableHandle'
