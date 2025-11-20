// src/components/ui/modals/DeleteConfirmationModal.tsx
import { FC, ReactNode } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '../AlertDialog';
import { useTranslation } from '@/features/system/i18n';

export interface DeleteConfirmationModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;

  /**
   * Callback when open state changes
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Callback when delete is confirmed
   */
  onConfirm: () => void | Promise<void>;

  /**
   * Whether the delete operation is in progress
   */
  isLoading?: boolean;

  /**
   * Modal title
   * @default "Delete Item?"
   */
  title?: string;

  /**
   * Name of the entity being deleted (will be highlighted)
   */
  entityName?: string;

  /**
   * Description/warning message
   * @default "This action cannot be undone."
   */
  description?: string;

  /**
   * Text for the confirm button
   * @default "Delete"
   */
  confirmText?: string;

  /**
   * Text for the cancel button
   * @default "Cancel"
   */
  cancelText?: string;

  /**
   * Variant for styling
   * @default "danger"
   */
  variant?: 'danger' | 'warning';

  /**
   * Custom icon component (overrides default)
   */
  icon?: ReactNode;

  /**
   * Custom content (overrides default description)
   */
  children?: ReactNode;

  /**
   * Whether to show the entity name section
   * @default true
   */
  showEntityDetails?: boolean;
}

/**
 * DeleteConfirmationModal - A reusable confirmation modal for delete operations
 *
 * Built on top of AlertDialog with pre-styled danger theme and common patterns
 * for delete confirmations across the application.
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * const { deleteEmployee, isDeleting } = useEmployees();
 *
 * <DeleteConfirmationModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onConfirm={async () => {
 *     await deleteEmployee(employeeId);
 *     navigate('/employees');
 *   }}
 *   isLoading={isDeleting}
 *   title="Delete Employee?"
 *   entityName="John Doe"
 *   description="This will permanently delete the employee and all associated data."
 * />
 * ```
 */
export const DeleteConfirmationModal: FC<DeleteConfirmationModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  title,
  entityName,
  description,
  confirmText,
  cancelText,
  variant = 'danger',
  icon,
  children,
  showEntityDetails = true,
}) => {
  const { t } = useTranslation('ui');

  const modalTitle = title || t('deleteConfirmation.defaultTitle');
  const modalDescription = description || t('deleteConfirmation.defaultDescription');
  const modalConfirmText = confirmText || t('deleteConfirmation.delete');
  const modalCancelText = cancelText || t('deleteConfirmation.cancel');

  const handleConfirm = async () => {
    await onConfirm();
    // Modal will be closed by parent component after successful deletion
  };

  const iconColor = variant === 'danger' ? 'text-red-600' : 'text-yellow-600';
  const iconBg = variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        {/* Icon and Title Section */}
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${iconBg} flex items-center justify-center`}>
              {icon || <AlertTriangle className={`h-6 w-6 ${iconColor}`} />}
            </div>

            {/* Title and Entity Name */}
            <div className="flex-1 space-y-2">
              <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                {modalTitle}
              </AlertDialogTitle>

              {showEntityDetails && entityName && (
                <div className="text-sm text-gray-600">
                  {t('deleteConfirmation.youAreAboutToDelete')}{' '}
                  <span className="font-semibold text-gray-900">{entityName}</span>
                </div>
              )}
            </div>
          </div>
        </AlertDialogHeader>

        {/* Description/Content Section */}
        <div className="py-4">
          {children || (
            <AlertDialogDescription className="text-base text-gray-700 leading-relaxed">
              {modalDescription}
            </AlertDialogDescription>
          )}

          {variant === 'danger' && !children && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 flex items-start gap-2">
                <span className="text-red-600 font-bold flex-shrink-0">⚠️</span>
                <span>
                  <strong>{t('deleteConfirmation.warning')}</strong> {t('deleteConfirmation.permanentWarning')}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel
            disabled={isLoading}
            className="sm:w-auto"
          >
            {modalCancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="sm:w-auto bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('deleteConfirmation.deleting')}
              </span>
            ) : (
              modalConfirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

/**
 * Hook for managing delete confirmation modal state
 *
 * @example
 * ```tsx
 * const deleteModal = useDeleteConfirmation({
 *   onConfirm: () => deleteEmployee(id),
 *   entityType: 'employee',
 *   entityName: employee.name
 * });
 *
 * <Button onClick={deleteModal.open}>Delete</Button>
 * <DeleteConfirmationModal {...deleteModal.props} />
 * ```
 */
export interface UseDeleteConfirmationOptions {
  onConfirm: () => void | Promise<void>;
  entityType?: string;
  entityName?: string;
  title?: string;
  description?: string;
}

export function useDeleteConfirmation(options: UseDeleteConfirmationOptions) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const confirm = async () => {
    setIsLoading(true);
    try {
      await options.onConfirm();
      close();
    } catch (error) {
      // Error should be handled by the onConfirm callback
      console.error('Delete confirmation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const props: Omit<DeleteConfirmationModalProps, 'onConfirm'> & { onConfirm: () => Promise<void> } = {
    open: isOpen,
    onOpenChange: setIsOpen,
    onConfirm: confirm,
    isLoading,
    title: options.title || (options.entityType ? `Delete ${options.entityType}?` : undefined),
    entityName: options.entityName,
    description: options.description,
  };

  return {
    isOpen,
    open,
    close,
    confirm,
    props,
  };
}

// Re-export React for the hook
import React from 'react';
