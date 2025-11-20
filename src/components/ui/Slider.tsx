// src/components/ui/Slider.tsx
import { forwardRef, useCallback, useState, useRef, useEffect, InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  inverted?: boolean;
  className?: string;
  trackClassName?: string;
  rangeClassName?: string;
  thumbClassName?: string;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  ({
    value: controlledValue,
    defaultValue = [0],
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    orientation = 'horizontal',
    inverted = false,
    className,
    trackClassName,
    rangeClassName,
    thumbClassName,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState<number | null>(null);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;
    const isVertical = orientation === 'vertical';

    const handleValueChange = useCallback((newValue: number[]) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    }, [isControlled, onValueChange]);

    const getValueFromPointer = useCallback((event: MouseEvent | TouchEvent) => {
      if (!sliderRef.current) return 0;

      const rect = sliderRef.current.getBoundingClientRect();
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      let percent;
      if (isVertical) {
        percent = (clientY - rect.top) / rect.height;
        if (inverted) percent = 1 - percent;
      } else {
        percent = (clientX - rect.left) / rect.width;
        if (inverted) percent = 1 - percent;
      }

      percent = Math.max(0, Math.min(1, percent));
      const newValue = min + percent * (max - min);
      return Math.round(newValue / step) * step;
    }, [min, max, step, isVertical, inverted]);

    const handlePointerMove = useCallback((event: MouseEvent | TouchEvent) => {
      if (isDragging === null || disabled) return;

      event.preventDefault();
      const newValue = getValueFromPointer(event);
      const newValues = [...value];
      newValues[isDragging] = newValue;
      handleValueChange(newValues.sort((a, b) => a - b));
    }, [isDragging, disabled, getValueFromPointer, value, handleValueChange]);

    const handlePointerUp = useCallback(() => {
      setIsDragging(null);
    }, []);

    useEffect(() => {
      if (isDragging !== null) {
        const handleMouseMove = (e: MouseEvent) => handlePointerMove(e);
        const handleMouseUp = () => handlePointerUp();
        const handleTouchMove = (e: TouchEvent) => handlePointerMove(e);
        const handleTouchEnd = () => handlePointerUp();

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
        };
      }
    }, [isDragging, handlePointerMove, handlePointerUp]);

    const handleThumbPointerDown = useCallback((event: React.MouseEvent | React.TouchEvent, thumbIndex: number) => {
      if (disabled) return;
      event.preventDefault();
      setIsDragging(thumbIndex);
    }, [disabled]);

    const handleTrackPointerDown = useCallback((event: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;
      
      const newValue = getValueFromPointer(event.nativeEvent);
      const closestThumbIndex = value.reduce((closest, thumbValue, index) => {
        return Math.abs(newValue - thumbValue) < Math.abs(newValue - value[closest]) ? index : closest;
      }, 0);

      const newValues = [...value];
      newValues[closestThumbIndex] = newValue;
      handleValueChange(newValues.sort((a, b) => a - b));
      setIsDragging(closestThumbIndex);
    }, [disabled, getValueFromPointer, value, handleValueChange]);

    const getThumbPosition = (thumbValue: number) => {
      const percent = ((thumbValue - min) / (max - min)) * 100;
      return inverted ? 100 - percent : percent;
    };

    const getRangePosition = () => {
      if (value.length === 1) {
        const startPercent = inverted ? getThumbPosition(value[0]) : 0;
        const endPercent = inverted ? 100 : getThumbPosition(value[0]);
        return { start: Math.min(startPercent, endPercent), width: Math.abs(endPercent - startPercent) };
      } else {
        const startPercent = getThumbPosition(Math.min(...value));
        const endPercent = getThumbPosition(Math.max(...value));
        return { start: startPercent, width: endPercent - startPercent };
      }
    };

    const range = getRangePosition();

    return (
      <div
        ref={ref}
        className={twMerge(
          'relative flex touch-none select-none items-center',
          isVertical ? 'h-full w-5 flex-col' : 'h-5 w-full',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {/* Track */}
        <div
          ref={sliderRef}
          className={twMerge(
            'relative flex-1 rounded-full bg-gray-200',
            isVertical ? 'w-2 h-full' : 'h-2 w-full',
            !disabled && 'cursor-pointer',
            trackClassName
          )}
          onMouseDown={handleTrackPointerDown}
          onTouchStart={handleTrackPointerDown}
        >
          {/* Range */}
          <div
            className={twMerge(
              'absolute rounded-full bg-blue-600',
              isVertical ? 'w-full' : 'h-full',
              rangeClassName
            )}
            style={
              isVertical
                ? { bottom: `${range.start}%`, height: `${range.width}%` }
                : { left: `${range.start}%`, width: `${range.width}%` }
            }
          />

          {/* Thumbs */}
          {value.map((thumbValue, index) => (
            <div
              key={index}
              className={twMerge(
                'absolute block h-5 w-5 rounded-full border-2 border-blue-600 bg-white shadow-md transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                !disabled && 'hover:bg-gray-50 cursor-grab',
                isDragging === index && !disabled && 'cursor-grabbing scale-110',
                disabled && 'cursor-not-allowed',
                thumbClassName
              )}
              style={
                isVertical
                  ? { bottom: `${getThumbPosition(thumbValue)}%`, transform: 'translateY(50%)' }
                  : { left: `${getThumbPosition(thumbValue)}%`, transform: 'translateX(-50%)' }
              }
              onMouseDown={(e) => handleThumbPointerDown(e, index)}
              onTouchStart={(e) => handleThumbPointerDown(e, index)}
              tabIndex={disabled ? -1 : 0}
              role="slider"
              aria-valuenow={thumbValue}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-orientation={orientation}
              aria-disabled={disabled}
            />
          ))}
        </div>
      </div>
    );
  }
);
Slider.displayName = 'Slider';