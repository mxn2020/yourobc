// src/components/ui/DateTimePicker.tsx
/**
 * DateTimePicker Component
 *
 * A comprehensive date and time picker component that extends the DatePicker
 * with time selection functionality.
 *
 * @example Basic Usage
 * ```tsx
 * <DateTimePicker
 *   value={selectedDateTime}
 *   onChange={(date) => setSelectedDateTime(date)}
 *   placeholder="Select date and time"
 *   label="Appointment"
 *   required
 * />
 * ```
 *
 * @example With Min/Max Dates
 * ```tsx
 * <DateTimePicker
 *   value={deadline}
 *   onChange={(date) => setDeadline(date)}
 *   min={new Date()} // Can't select dates in the past
 *   max={new Date('2025-12-31')} // Can't select dates after 2025
 * />
 * ```
 *
 * Features:
 * - Date and time selection in one component
 * - Clearable with X button
 * - Min/Max date validation
 * - Custom disabled dates function
 * - Form integration (label, error, helpText)
 * - 12-hour or 24-hour time format
 * - Keyboard accessible
 * - Responsive design
 */
import { forwardRef, useId, memo, useState, useCallback, useMemo } from 'react'
import type { ElementRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Calendar as CalendarIcon, X, Clock } from 'lucide-react'
import { Calendar } from './Calendar'
import { Popover, PopoverTrigger, PopoverContent } from './Popover'
import type { InputSize, FormComponentProps } from './types'
import { useTranslation } from '@/features/boilerplate/i18n'

// Date/Time formatting utilities
const formatDateTime = (date: Date, format24Hour: boolean = false): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')

  if (format24Hour) {
    const hoursStr = hours.toString().padStart(2, '0')
    return `${month}/${day}/${year} ${hoursStr}:${minutes}`
  } else {
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`
  }
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

interface DateTimePickerProps extends Omit<FormComponentProps, 'disabled'> {
  value?: Date
  onChange?: (date: Date | undefined) => void
  label?: string
  placeholder?: string
  size?: InputSize
  className?: string
  id?: string
  disabled?: boolean | ((date: Date) => boolean)
  required?: boolean
  min?: Date
  max?: Date
  defaultMonth?: Date
  clearable?: boolean
  format24Hour?: boolean
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-3 py-2 text-sm h-10',
  lg: 'px-4 py-3 text-base h-12'
}

export const DateTimePicker = memo(forwardRef<ElementRef<'button'>, DateTimePickerProps>(
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
      placeholder,
      min,
      max,
      defaultMonth,
      clearable = true,
      format24Hour = false,
      value,
      onChange,
    } = props

    const { t } = useTranslation('ui');
    const defaultPlaceholder = placeholder || t('dateTimePicker.placeholder');
    const generatedId = useId()
    const inputId = id || generatedId
    const hasError = Boolean(error)
    const [open, setOpen] = useState(false)

    // Local state for time inputs
    const [hours, setHours] = useState<string>(() => {
      if (!value) return format24Hour ? '00' : '12'
      const h = value.getHours()
      return format24Hour ? h.toString().padStart(2, '0') : ((h % 12) || 12).toString()
    })

    const [minutes, setMinutes] = useState<string>(() => {
      if (!value) return '00'
      return value.getMinutes().toString().padStart(2, '0')
    })

    const [ampm, setAmpm] = useState<'AM' | 'PM'>(() => {
      if (!value || format24Hour) return 'AM'
      return value.getHours() >= 12 ? 'PM' : 'AM'
    })

    // Determine if the entire component is disabled
    const isComponentDisabled = typeof disabled === 'boolean' ? disabled : false

    // Determine the disabled function for calendar
    const calendarDisabled = useMemo(() => {
      if (typeof disabled === 'function') return disabled

      // Create disabled function based on min/max
      if (min || max) {
        return (date: Date) => {
          if (min && date < min && !isSameDay(date, min)) return true
          if (max && date > max && !isSameDay(date, max)) return true
          return false
        }
      }

      return undefined
    }, [disabled, min, max])

    // Get display value
    const displayValue = useMemo(() => {
      return value ? formatDateTime(value, format24Hour) : ''
    }, [value, format24Hour])

    // Handle calendar selection
    const handleCalendarSelect = useCallback((selectedDate: Date | Date[] | undefined) => {
      if (selectedDate instanceof Date) {
        // Create a new date with current time values
        const newDate = new Date(selectedDate)

        if (format24Hour) {
          const h = parseInt(hours) || 0
          newDate.setHours(h)
        } else {
          let h = parseInt(hours) || 12
          if (ampm === 'PM' && h !== 12) h += 12
          if (ampm === 'AM' && h === 12) h = 0
          newDate.setHours(h)
        }

        newDate.setMinutes(parseInt(minutes) || 0)
        newDate.setSeconds(0)
        newDate.setMilliseconds(0)

        onChange?.(newDate)
        // Don't close popover yet - let user set time
      } else if (selectedDate === undefined) {
        onChange?.(undefined)
      }
    }, [hours, minutes, ampm, format24Hour, onChange])

    // Handle time change
    const handleTimeChange = useCallback(() => {
      if (!value) return

      const newDate = new Date(value)

      if (format24Hour) {
        const h = parseInt(hours) || 0
        newDate.setHours(Math.max(0, Math.min(23, h)))
      } else {
        let h = parseInt(hours) || 12
        if (ampm === 'PM' && h !== 12) h += 12
        if (ampm === 'AM' && h === 12) h = 0
        newDate.setHours(h)
      }

      const m = parseInt(minutes) || 0
      newDate.setMinutes(Math.max(0, Math.min(59, m)))
      newDate.setSeconds(0)
      newDate.setMilliseconds(0)

      onChange?.(newDate)
    }, [value, hours, minutes, ampm, format24Hour, onChange])

    // Update time when inputs change
    const handleHoursChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '')
      const max = format24Hour ? 23 : 12
      const num = parseInt(val) || 0
      setHours(val)

      if (val.length === 2 && num >= 0 && num <= max) {
        handleTimeChange()
      }
    }, [format24Hour, handleTimeChange])

    const handleMinutesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '')
      const num = parseInt(val) || 0
      setMinutes(val)

      if (val.length === 2 && num >= 0 && num <= 59) {
        handleTimeChange()
      }
    }, [handleTimeChange])

    const handleAmPmToggle = useCallback(() => {
      setAmpm(prev => {
        const newAmPm = prev === 'AM' ? 'PM' : 'AM'

        // Update the time immediately
        if (value) {
          const newDate = new Date(value)
          let h = parseInt(hours) || 12

          if (newAmPm === 'PM' && h !== 12) h += 12
          if (newAmPm === 'AM' && h === 12) h = 0

          newDate.setHours(h)
          onChange?.(newDate)
        }

        return newAmPm
      })
    }, [value, hours, onChange])

    // Handle clear
    const handleClear = useCallback((e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.(undefined)
      setHours(format24Hour ? '00' : '12')
      setMinutes('00')
      setAmpm('AM')
    }, [format24Hour, onChange])

    // Get the default month for calendar
    const calendarDefaultMonth = useMemo(() => {
      if (defaultMonth) return defaultMonth
      if (value) return value
      return new Date()
    }, [defaultMonth, value])

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
                  {displayValue || defaultPlaceholder}
                </span>
              </span>

              {showClearButton && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-shrink-0 ml-2 p-0.5 hover:bg-gray-100 rounded transition-colors"
                  aria-label={t('dateTimePicker.clearDateTime')}
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
            <div>
              <Calendar
                mode="single"
                selected={value}
                onSelect={handleCalendarSelect}
                disabled={calendarDisabled}
                fromDate={min}
                toDate={max}
                defaultMonth={calendarDefaultMonth}
                numberOfMonths={1}
              />

              {/* Time picker section */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={hours}
                      onChange={handleHoursChange}
                      onBlur={() => {
                        const max = format24Hour ? 23 : 12
                        const min = format24Hour ? 0 : 1
                        let num = parseInt(hours) || min
                        num = Math.max(min, Math.min(max, num))
                        setHours(num.toString().padStart(2, '0'))
                        handleTimeChange()
                      }}
                      className="w-12 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('dateTimePicker.hourPlaceholder')}
                      maxLength={2}
                    />
                    <span className="text-gray-400">:</span>
                    <input
                      type="text"
                      value={minutes}
                      onChange={handleMinutesChange}
                      onBlur={() => {
                        let num = parseInt(minutes) || 0
                        num = Math.max(0, Math.min(59, num))
                        setMinutes(num.toString().padStart(2, '0'))
                        handleTimeChange()
                      }}
                      className="w-12 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('dateTimePicker.minutePlaceholder')}
                      maxLength={2}
                    />
                  </div>

                  {!format24Hour && (
                    <button
                      type="button"
                      onClick={handleAmPmToggle}
                      className="px-3 py-1 text-sm font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      {ampm}
                    </button>
                  )}
                </div>

                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    {t('dateTimePicker.done')}
                  </button>
                </div>
              </div>
            </div>
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
DateTimePicker.displayName = 'DateTimePicker'
