// src/components/ui/Section.tsx
import { forwardRef, ReactNode, memo } from 'react';
import { twMerge } from 'tailwind-merge';

// Root Section component
interface SectionProps {
  children: ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

const spacingClasses = {
  none: '',
  sm: 'mb-4',
  md: 'mb-6',
  lg: 'mb-8',
  xl: 'mb-12'
};

export const Section = memo(forwardRef<HTMLElement, SectionProps>(
  ({ children, className, spacing = 'none', id }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={twMerge(
          'w-full',
          spacingClasses[spacing],
          className
        )}
      >
        {children}
      </section>
    );
  }
));
Section.displayName = 'Section';

// SectionHeader component
interface SectionHeaderProps {
  children: ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

const headerSpacingClasses = {
  none: '',
  sm: 'mb-2',
  md: 'mb-4',
  lg: 'mb-6'
};

export const SectionHeader = memo(forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ children, className, spacing = 'md' }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          'flex flex-col',
          headerSpacingClasses[spacing],
          className
        )}
      >
        {children}
      </div>
    );
  }
));
SectionHeader.displayName = 'SectionHeader';

// SectionTitle component
interface SectionTitleProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const titleSizeClasses = {
  sm: 'text-lg font-semibold',
  md: 'text-xl font-semibold',
  lg: 'text-2xl font-bold',
  xl: 'text-3xl font-bold'
};

export const SectionTitle = memo(forwardRef<HTMLHeadingElement, SectionTitleProps>(
  ({ children, className, size = 'md', as: Component = 'h2' }, ref) => {
    return (
      <Component
        ref={ref}
        className={twMerge(
          'text-gray-900',
          titleSizeClasses[size],
          className
        )}
      >
        {children}
      </Component>
    );
  }
));
SectionTitle.displayName = 'SectionTitle';

// SectionDescription component
interface SectionDescriptionProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const descriptionSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
};

export const SectionDescription = memo(forwardRef<HTMLParagraphElement, SectionDescriptionProps>(
  ({ children, className, size = 'md' }, ref) => {
    return (
      <p
        ref={ref}
        className={twMerge(
          'text-gray-600 mt-2',
          descriptionSizeClasses[size],
          className
        )}
      >
        {children}
      </p>
    );
  }
));
SectionDescription.displayName = 'SectionDescription';

// SectionContent component
interface SectionContentProps {
  children: ReactNode;
  className?: string;
}

export const SectionContent = memo(forwardRef<HTMLDivElement, SectionContentProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge('w-full', className)}
      >
        {children}
      </div>
    );
  }
));
SectionContent.displayName = 'SectionContent';

// CompoundSection - convenience component with header and content
interface CompoundSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  titleSize?: 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  id?: string;
}

export const CompoundSection = memo(forwardRef<HTMLElement, CompoundSectionProps>(
  ({
    children,
    title,
    description,
    titleSize = 'md',
    spacing = 'lg',
    className,
    id
  }, ref) => {
    return (
      <Section ref={ref} spacing={spacing} className={className} id={id}>
        {(title || description) && (
          <SectionHeader>
            {title && <SectionTitle size={titleSize}>{title}</SectionTitle>}
            {description && <SectionDescription>{description}</SectionDescription>}
          </SectionHeader>
        )}
        <SectionContent>{children}</SectionContent>
      </Section>
    );
  }
));
CompoundSection.displayName = 'CompoundSection';
