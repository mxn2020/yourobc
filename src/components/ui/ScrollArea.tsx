// src/components/ui/ScrollArea.tsx
import { forwardRef, memo, ReactNode, useRef, useEffect, useState, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal' | 'both';
  maxHeight?: string;
  maxWidth?: string;
  hideScrollbar?: boolean;
}

interface ScrollbarProps {
  orientation: 'vertical' | 'horizontal';
  scrollPercentage: number;
  thumbSize: number;
  visible: boolean;
  onScrollbarClick: (position: number) => void;
}

const Scrollbar = memo(({
  orientation,
  scrollPercentage,
  thumbSize,
  visible,
  onScrollbarClick
}: ScrollbarProps) => {
  const isVertical = orientation === 'vertical';

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = isVertical
      ? (e.clientY - rect.top) / rect.height
      : (e.clientX - rect.left) / rect.width;
    onScrollbarClick(position);
  }, [isVertical, onScrollbarClick]);

  if (!visible) return null;

  return (
    <div
      className={twMerge(
        'absolute transition-opacity duration-200',
        isVertical
          ? 'right-0 top-0 bottom-0 w-2'
          : 'left-0 right-0 bottom-0 h-2',
        'opacity-0 hover:opacity-100 group-hover:opacity-100'
      )}
      onClick={handleClick}
    >
      <div
        className={twMerge(
          'bg-gray-300 hover:bg-gray-400 rounded-full transition-colors',
          isVertical ? 'w-full' : 'h-full'
        )}
        style={{
          [isVertical ? 'height' : 'width']: `${thumbSize}%`,
          [isVertical ? 'top' : 'left']: `${scrollPercentage}%`,
          position: 'absolute'
        }}
      />
    </div>
  );
});
Scrollbar.displayName = 'Scrollbar';

export const ScrollArea = memo(forwardRef<HTMLDivElement, ScrollAreaProps>(({
  children,
  className,
  orientation = 'vertical',
  maxHeight,
  maxWidth,
  hideScrollbar = false
}, ref) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [verticalScroll, setVerticalScroll] = useState({ percentage: 0, thumbSize: 100 });
  const [horizontalScroll, setHorizontalScroll] = useState({ percentage: 0, thumbSize: 100 });
  const [showScrollbars, setShowScrollbars] = useState(false);

  const updateScrollMetrics = useCallback(() => {
    if (!scrollRef.current) return;

    const {
      scrollTop,
      scrollLeft,
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth
    } = scrollRef.current;

    // Vertical scroll metrics
    const verticalScrollable = scrollHeight > clientHeight;
    const verticalThumbSize = verticalScrollable
      ? (clientHeight / scrollHeight) * 100
      : 100;
    const verticalPercentage = verticalScrollable
      ? (scrollTop / (scrollHeight - clientHeight)) * (100 - verticalThumbSize)
      : 0;

    setVerticalScroll({ percentage: verticalPercentage, thumbSize: verticalThumbSize });

    // Horizontal scroll metrics
    const horizontalScrollable = scrollWidth > clientWidth;
    const horizontalThumbSize = horizontalScrollable
      ? (clientWidth / scrollWidth) * 100
      : 100;
    const horizontalPercentage = horizontalScrollable
      ? (scrollLeft / (scrollWidth - clientWidth)) * (100 - horizontalThumbSize)
      : 0;

    setHorizontalScroll({ percentage: horizontalPercentage, thumbSize: horizontalThumbSize });

    setShowScrollbars(verticalScrollable || horizontalScrollable);
  }, []);

  useEffect(() => {
    updateScrollMetrics();

    const resizeObserver = new ResizeObserver(updateScrollMetrics);
    const currentRef = scrollRef.current;

    if (currentRef) {
      resizeObserver.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef);
      }
    };
  }, [updateScrollMetrics, children]);

  const handleVerticalScrollbarClick = useCallback((position: number) => {
    if (!scrollRef.current) return;
    const { scrollHeight, clientHeight } = scrollRef.current;
    const maxScroll = scrollHeight - clientHeight;
    scrollRef.current.scrollTop = position * maxScroll;
  }, []);

  const handleHorizontalScrollbarClick = useCallback((position: number) => {
    if (!scrollRef.current) return;
    const { scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    scrollRef.current.scrollLeft = position * maxScroll;
  }, []);

  const mergedRef = useCallback((node: HTMLDivElement | null) => {
    if (scrollRef.current !== node) {
      (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  const showVertical = (orientation === 'vertical' || orientation === 'both') && !hideScrollbar;
  const showHorizontal = (orientation === 'horizontal' || orientation === 'both') && !hideScrollbar;

  return (
    <div className={twMerge('relative group', className)}>
      <div
        ref={mergedRef}
        className={twMerge(
          'overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent',
          hideScrollbar && 'scrollbar-hide',
          className
        )}
        style={{
          maxHeight,
          maxWidth
        }}
        onScroll={updateScrollMetrics}
      >
        {children}
      </div>

      {showScrollbars && !hideScrollbar && (
        <>
          {showVertical && (
            <Scrollbar
              orientation="vertical"
              scrollPercentage={verticalScroll.percentage}
              thumbSize={verticalScroll.thumbSize}
              visible={verticalScroll.thumbSize < 100}
              onScrollbarClick={handleVerticalScrollbarClick}
            />
          )}
          {showHorizontal && (
            <Scrollbar
              orientation="horizontal"
              scrollPercentage={horizontalScroll.percentage}
              thumbSize={horizontalScroll.thumbSize}
              visible={horizontalScroll.thumbSize < 100}
              onScrollbarClick={handleHorizontalScrollbarClick}
            />
          )}
        </>
      )}
    </div>
  );
}));
ScrollArea.displayName = 'ScrollArea';
