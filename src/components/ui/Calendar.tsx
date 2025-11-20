// src/components/ui/Calendar.tsx
import { useState, useCallback, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Date utility functions
const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Calendar component interface
interface CalendarProps {
  selected?: Date | Date[];
  onSelect?: (date: Date | Date[] | undefined) => void;
  mode?: 'single' | 'multiple' | 'range';
  disabled?: (date: Date) => boolean;
  className?: string;
  showOutsideDays?: boolean;
  numberOfMonths?: number;
  defaultMonth?: Date;
  fromDate?: Date;
  toDate?: Date;
  fixedWeeks?: boolean;
}

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  ({
    selected,
    onSelect,
    mode = 'single',
    disabled,
    className,
    showOutsideDays = true,
    numberOfMonths = 1,
    defaultMonth,
    fromDate,
    toDate,
    fixedWeeks = false
  }, ref) => {
    const [currentMonth, setCurrentMonth] = useState<Date>(() => {
      if (defaultMonth) return defaultMonth;
      if (Array.isArray(selected) && selected.length > 0) return selected[0];
      if (selected && !Array.isArray(selected)) return selected;
      return new Date();
    });

    const handlePreviousMonth = useCallback(() => {
      setCurrentMonth(prev => addMonths(prev, -1));
    }, []);

    const handleNextMonth = useCallback(() => {
      setCurrentMonth(prev => addMonths(prev, 1));
    }, []);

    const handleDateSelect = useCallback((date: Date) => {
      if (disabled?.(date)) return;

      if (!onSelect) return;

      if (mode === 'single') {
        onSelect(date);
      } else if (mode === 'multiple') {
        const selectedArray = Array.isArray(selected) ? selected : [];
        const isSelected = selectedArray.some(d => isSameDay(d, date));
        
        if (isSelected) {
          onSelect(selectedArray.filter(d => !isSameDay(d, date)));
        } else {
          onSelect([...selectedArray, date]);
        }
      } else if (mode === 'range') {
        const selectedArray = Array.isArray(selected) ? selected : [];
        
        if (selectedArray.length === 0) {
          onSelect([date]);
        } else if (selectedArray.length === 1) {
          const [start] = selectedArray;
          if (date < start) {
            onSelect([date, start]);
          } else {
            onSelect([start, date]);
          }
        } else {
          onSelect([date]);
        }
      }
    }, [selected, onSelect, mode, disabled]);

    const isDateSelected = useCallback((date: Date): boolean => {
      if (!selected) return false;
      
      if (Array.isArray(selected)) {
        return selected.some(d => isSameDay(d, date));
      } else {
        return isSameDay(selected, date);
      }
    }, [selected]);

    const isDateInRange = useCallback((date: Date): boolean => {
      if (mode !== 'range' || !Array.isArray(selected) || selected.length !== 2) {
        return false;
      }
      
      const [start, end] = selected.sort((a, b) => a.getTime() - b.getTime());
      return date >= start && date <= end;
    }, [mode, selected]);

    const isDateRangeStart = useCallback((date: Date): boolean => {
      if (mode !== 'range' || !Array.isArray(selected) || selected.length === 0) {
        return false;
      }
      
      const start = selected.sort((a, b) => a.getTime() - b.getTime())[0];
      return isSameDay(date, start);
    }, [mode, selected]);

    const isDateRangeEnd = useCallback((date: Date): boolean => {
      if (mode !== 'range' || !Array.isArray(selected) || selected.length < 2) {
        return false;
      }
      
      const end = selected.sort((a, b) => a.getTime() - b.getTime())[1];
      return isSameDay(date, end);
    }, [mode, selected]);

    const renderMonth = (monthDate: Date, monthIndex: number) => {
      const daysInMonth = getDaysInMonth(monthDate);
      const firstDayOfMonth = getFirstDayOfMonth(monthDate);
      const days: (Date | null)[] = [];

      // Add previous month's trailing days
      if (showOutsideDays && firstDayOfMonth > 0) {
        const prevMonth = addMonths(monthDate, -1);
        const daysInPrevMonth = getDaysInMonth(prevMonth);
        
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
          days.push(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i));
        }
      } else {
        for (let i = 0; i < firstDayOfMonth; i++) {
          days.push(null);
        }
      }

      // Add current month's days
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
      }

      // Add next month's leading days
      const totalCells = fixedWeeks ? 42 : Math.ceil(days.length / 7) * 7;
      const remainingCells = totalCells - days.length;
      
      if (showOutsideDays && remainingCells > 0) {
        const nextMonth = addMonths(monthDate, 1);
        for (let day = 1; day <= remainingCells; day++) {
          days.push(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day));
        }
      } else {
        for (let i = 0; i < remainingCells; i++) {
          days.push(null);
        }
      }

      const weeks: (Date | null)[][] = [];
      for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
      }

      return (
        <div key={monthIndex} className="space-y-4">
          {/* Month header */}
          <div className="flex items-center justify-between">
            {monthIndex === 0 && (
              <button
                type="button"
                onClick={handlePreviousMonth}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 transition-colors"
                disabled={fromDate && addMonths(currentMonth, -1) < fromDate}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous month</span>
              </button>
            )}
            
            <div className="text-sm font-medium">
              {monthNames[monthDate.getMonth()]} {monthDate.getFullYear()}
            </div>
            
            {monthIndex === numberOfMonths - 1 && (
              <button
                type="button"
                onClick={handleNextMonth}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 transition-colors"
                disabled={toDate && addMonths(currentMonth, 1) > toDate}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next month</span>
              </button>
            )}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map((dayName) => (
              <div
                key={dayName}
                className="flex h-7 w-7 items-center justify-center text-xs font-medium text-gray-500"
              >
                {dayName}
              </div>
            ))}
            
            {/* Calendar days */}
            {weeks.map((week, weekIndex) =>
              week.map((date, dayIndex) => {
                if (!date) {
                  return <div key={`${weekIndex}-${dayIndex}`} className="h-7 w-7" />;
                }

                const isCurrentMonth = date.getMonth() === monthDate.getMonth();
                const isSelected = isDateSelected(date);
                const isInRange = isDateInRange(date);
                const isRangeStart = isDateRangeStart(date);
                const isRangeEnd = isDateRangeEnd(date);
                const isTodayDate = isToday(date);
                const isDisabled = disabled?.(date) || 
                  (fromDate && date < fromDate) || 
                  (toDate && date > toDate);

                return (
                  <button
                    key={`${weekIndex}-${dayIndex}`}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    disabled={isDisabled}
                    className={twMerge(
                      'flex h-7 w-7 items-center justify-center rounded-md text-xs font-normal transition-colors',
                      'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      !isCurrentMonth && 'text-gray-400',
                      isCurrentMonth && 'text-gray-900',
                      isTodayDate && 'bg-gray-100 font-semibold',
                      isSelected && 'bg-blue-600 text-white hover:bg-blue-700',
                      isInRange && !isSelected && 'bg-blue-100',
                      (isRangeStart || isRangeEnd) && 'bg-blue-600 text-white',
                      isDisabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                    )}
                    aria-selected={isSelected}
                  >
                    {date.getDate()}
                  </button>
                );
              })
            )}
          </div>
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={twMerge('p-3', className)}
      >
        <div className={twMerge(
          'grid gap-4',
          numberOfMonths === 2 ? 'grid-cols-2' : 'grid-cols-1'
        )}>
          {Array.from({ length: numberOfMonths }, (_, i) => 
            renderMonth(addMonths(currentMonth, i), i)
          )}
        </div>
      </div>
    );
  }
);
Calendar.displayName = 'Calendar';