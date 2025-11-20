// src/components/ui/DatePicker.tsx
/**
 * DatePicker Component
 *
 * A comprehensive date picker component that supports both single date selection and date ranges.
 * Built on top of the Calendar and Popover components.
 *
 * @example Single Date Mode
 * ```tsx
 * <DatePicker
 *   mode="single"
 *   label="Hire Date"
 *   value={selectedDate}
 *   onChange={(date) => setSelectedDate(date)}
 *   placeholder="Select a date"
 *   fromDate={new Date()} // Disable dates before today
 *   required
 * />
 * ```
 *
 * @example Date Range Mode
 * ```tsx
 * <DatePicker
 *   mode="range"
 *   label="Vacation Period"
 *   value={dateRange} // { start: Date, end: Date }
 *   onChange={(range) => setDateRange(range)}
 *   placeholder="Select date range"
 * />
 * ```
 *
 * Features:
 * - Single date or date range selection
 * - Clearable dates with X button
 * - Date validation (fromDate, toDate)
 * - Custom disabled dates function
 * - Form integration (label, error, helpText)
 * - Keyboard accessible
 * - Responsive design
 */
import { forwardRef, useId, memo, useState, useCallback, useMemo } from 'react'
import type { ElementRef, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { Calendar } from './Calendar'
import { Popover, PopoverTrigger, PopoverContent } from './Popover'
import type { InputSize, FormComponentProps } from './types'

// Date formatting utilities
const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

const formatDateRange = (start: Date, end: Date): string => {
  return `${formatDate(start)} - ${formatDate(end)}`
}

const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null

  // Try parsing MM/DD/YYYY format
  const parts = dateString.split('/')
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10) - 1
    const day = parseInt(parts[1], 10)
    const year = parseInt(parts[2], 10)

    const date = new Date(year, month, day)
    if (!isNaN(date.getTime())) {
      return date
    }
  }

  // Fallback to standard Date parsing
  const parsed = new Date(dateString)
  return isNaN(parsed.getTime()) ? null : parsed
}

// Single date picker props
interface SingleDatePickerProps extends Omit<FormComponentProps, 'disabled'> {
  mode: 'single'
  value?: Date
  onChange?: (date: Date | undefined) => void
  label?: string
  placeholder?: string
  size?: InputSize
  className?: string
  id?: string
  disabled?: boolean | ((date: Date) => boolean)
  required?: boolean
  fromDate?: Date
  toDate?: Date
  defaultMonth?: Date
  clearable?: boolean
}

// Date range picker props
interface RangeDatePickerProps extends Omit<FormComponentProps, 'disabled'> {
  mode: 'range'
  value?: { start: Date; end: Date }
  onChange?: (range: { start: Date; end: Date } | undefined) => void
  label?: string
  placeholder?: string
  size?: InputSize
  className?: string
  id?: string
  disabled?: boolean | ((date: Date) => boolean)
  required?: boolean
  fromDate?: Date
  toDate?: Date
  defaultMonth?: Date
  clearable?: boolean
}

type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-3 py-2 text-sm h-10',
  lg: 'px-4 py-3 text-base h-12'
}

export const DatePicker = memo(forwardRef<ElementRef<'button'>, DatePickerProps>(
  (props, ref) => {
    const {
      label,
      error,
      helpText,
      size = 'md',
      className,
      id,
      disabled,
      required = false,
      placeholder = 'Select date...',
      fromDate,
      toDate,
      defaultMonth,
      clearable = true,
    } = props

    const generatedId = useId()
    const inputId = id || generatedId
    const hasError = Boolean(error)
    const [open, setOpen] = useState(false)

    // Determine if the entire component is disabled
    const isComponentDisabled = typeof disabled === 'boolean' ? disabled : false

    // Determine the disabled function for calendar
    const calendarDisabled = useMemo(() => {
      return typeof disabled === 'function' ? disabled : undefined
    }, [disabled])

    // Get display value
    const displayValue = useMemo(() => {
      if (props.mode === 'single') {
        return props.value ? formatDate(props.value) : ''
      } else {
        if (props.value?.start && props.value?.end) {
          return formatDateRange(props.value.start, props.value.end)
        }
        return ''
      }
    }, [props])

    // Handle calendar selection
    const handleCalendarSelect = useCallback((date: Date | Date[] | undefined) => {
      if (props.mode === 'single') {
        if (date instanceof Date) {
          props.onChange?.(date)
          setOpen(false)
        } else if (date === undefined) {
          props.onChange?.(undefined)
          setOpen(false)
        }
      } else {
        // Range mode
        if (Array.isArray(date) && date.length === 2) {
          props.onChange?.({ start: date[0], end: date[1] })
          setOpen(false)
        } else if (date === undefined) {
          props.onChange?.(undefined)
        }
      }
    }, [props])

    // Handle clear
    const handleClear = useCallback((e: React.MouseEvent) => {
      e.stopPropagation()
      if (props.mode === 'single') {
        props.onChange?.(undefined)
      } else {
        props.onChange?.(undefined)
      }
    }, [props])

    // Prepare calendar selected value
    const calendarSelected = useMemo(() => {
      if (props.mode === 'single') {
        return props.value
      } else {
        if (props.value?.start && props.value?.end) {
          return [props.value.start, props.value.end]
        }
        return undefined
      }
    }, [props])

    // Get the default month for calendar
    const calendarDefaultMonth = useMemo(() => {
      if (defaultMonth) return defaultMonth

      if (props.mode === 'single' && props.value) {
        return props.value
      }

      if (props.mode === 'range' && props.value?.start) {
        return props.value.start
      }

      return new Date()
    }, [defaultMonth, props])

    const showClearButton = clearable && displayValue && !isComponentDisabled

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={twMerge(
              'block text-sm font-medium text-gray-700 mb-1',
              isComponentDisabled && 'opacity-50'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              id={inputId}
              type="button"
              disabled={isComponentDisabled}
              className={twMerge(
                'flex items-center justify-between w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors bg-white',
                sizeClasses[size],
                hasError && 'border-red-300 focus:ring-red-500 focus:border-red-500',
                className
              )}
              aria-invalid={hasError}
              aria-describedby={
                error ? `${inputId}-error` :
                helpText ? `${inputId}-help` : undefined
              }
            >
              <span className={twMerge(
                'flex items-center gap-2 flex-1 text-left',
                !displayValue && 'text-gray-400'
              )}>
                <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">
                  {displayValue || placeholder}
                </span>
              </span>

              {showClearButton && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-shrink-0 ml-2 p-0.5 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Clear date"
                >
                  <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            className="w-auto p-0"
            sideOffset={8}
          >
            <Calendar
              mode={props.mode}
              selected={calendarSelected}
              onSelect={handleCalendarSelect}
              disabled={calendarDisabled}
              fromDate={fromDate}
              toDate={toDate}
              defaultMonth={calendarDefaultMonth}
              numberOfMonths={props.mode === 'range' ? 2 : 1}
            />
          </PopoverContent>
        </Popover>

        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}

        {helpText && !error && (
          <p id={`${inputId}-help`} className="mt-1 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    )
  }
))
DatePicker.displayName = 'DatePicker'
