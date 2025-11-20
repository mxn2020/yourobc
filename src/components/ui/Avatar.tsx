// src/components/ui/Avatar.tsx
import { forwardRef, useState, ReactNode, memo, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

// Root Avatar component
interface AvatarProps {
  children: ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  asChild?: boolean;
}

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
  '2xl': 'h-20 w-20'
};

export const Avatar = memo(forwardRef<HTMLDivElement, AvatarProps>(
  ({ children, className, size = 'md', asChild = false }, ref) => {
    const avatarClassName = twMerge(
      'relative flex shrink-0 overflow-hidden rounded-full',
      sizeClasses[size],
      className
    )

    if (asChild) {
      const child = children as React.ReactElement;
      return (
        <div className={avatarClassName}>
          {child}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={avatarClassName}
      >
        {children}
      </div>
    );
  }
));
Avatar.displayName = 'Avatar';

// AvatarImage component
interface AvatarImageProps {
  src?: string;
  alt?: string;
  className?: string;
  onLoadingStatusChange?: (status: 'idle' | 'loading' | 'loaded' | 'error') => void;
}

export const AvatarImage = memo(forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ src, alt, className, onLoadingStatusChange }, ref) => {
    const [imageLoadingStatus, setImageLoadingStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');

    const handleLoad = useCallback(() => {
      setImageLoadingStatus('loaded');
      onLoadingStatusChange?.('loaded');
    }, [onLoadingStatusChange]);

    const handleError = useCallback(() => {
      setImageLoadingStatus('error');
      onLoadingStatusChange?.('error');
    }, [onLoadingStatusChange]);

    const handleLoadStart = useCallback(() => {
      setImageLoadingStatus('loading');
      onLoadingStatusChange?.('loading');
    }, [onLoadingStatusChange]);

    if (!src) {
      return null;
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={twMerge(
          'aspect-square h-full w-full object-cover',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        onLoadStart={handleLoadStart}
        style={{
          display: imageLoadingStatus === 'loaded' ? 'block' : 'none'
        }}
      />
    );
  }
));
AvatarImage.displayName = 'AvatarImage';

// AvatarFallback component
interface AvatarFallbackProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

export const AvatarFallback = memo(forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ children, className, delayMs = 0 }, ref) => {
    const [canRender, setCanRender] = useState(delayMs === 0);

    // Handle delay for fallback rendering
    useState(() => {
      if (delayMs > 0) {
        const timer = setTimeout(() => {
          setCanRender(true);
        }, delayMs);

        return () => clearTimeout(timer);
      }
    });

    if (!canRender) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={twMerge(
          'flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium',
          className
        )}
      >
        {children}
      </div>
    );
  }
));
AvatarFallback.displayName = 'AvatarFallback';

// Utility function to get initials from a name
export const getAvatarInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

// Compound Avatar with automatic fallback handling
interface CompoundAvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  fallback?: ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showFallback?: boolean;
}

export const CompoundAvatar = memo(forwardRef<HTMLDivElement, CompoundAvatarProps>(
  ({ src, alt, name, fallback, className, size = 'md', showFallback = true }, ref) => {
    const [imageStatus, setImageStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
    
    const shouldShowFallback = !src || imageStatus === 'error' || !showFallback;
    const initials = name ? getAvatarInitials(name) : '';
    const displayAlt = alt || name || 'Avatar';

    const handleImageStatusChange = useCallback((status: 'idle' | 'loading' | 'loaded' | 'error') => {
      setImageStatus(status);
    }, []);

    return (
      <Avatar ref={ref} className={className} size={size}>
        {src && (
          <AvatarImage
            src={src}
            alt={displayAlt}
            onLoadingStatusChange={handleImageStatusChange}
          />
        )}
        {shouldShowFallback && (
          <AvatarFallback>
            {fallback || initials || displayAlt.charAt(0).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
    );
  }
));
CompoundAvatar.displayName = 'CompoundAvatar';